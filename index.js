async function getData(url) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
    });
    return response.json();
}

async function loadCountriesData() {
    const countries = await getData('https://restcountries.com/v3.1/all?fields=name&fields=cca3&fields=area');
    return countries.reduce((result, country) => {
        result[country.name.common] = country;
        return result;
    }, {});
}

async function getCountrieData(cca3) {
    const countrieData = await getData(`https://restcountries.com/v3.1/alpha/${cca3}?fields=name&fields=borders`);
    return countrieData;
}

const form = document.getElementById('form');
const fromCountry = document.getElementById('fromCountry');
const toCountry = document.getElementById('toCountry');
const countriesList = document.getElementById('countriesList');
const submit = document.getElementById('submit');
const output = document.getElementById('output');

(async () => {
    fromCountry.disabled = true;
    toCountry.disabled = true;
    submit.disabled = true;

    output.textContent = 'Loading…';
    const countriesData = await loadCountriesData();
    output.textContent = '';

    // Заполняем список стран для подсказки в инпутах
    Object.keys(countriesData)
        .sort((a, b) => countriesData[b].area - countriesData[a].area)
        .forEach((code) => {
            const option = document.createElement('option');
            option.value = countriesData[code].name.common;
            countriesList.appendChild(option);
        });

    fromCountry.disabled = false;
    toCountry.disabled = false;
    submit.disabled = false;

    const archive = {};
    let search = true;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const fromCountryValue = countriesData[fromCountry.value].cca3;
        const toCountryValue = countriesData[toCountry.value].cca3;
        const way = [];
        let countOfRequests = 1;
        let countOfAttemps = 0;
        let nextSearching;

        const getBorders = (searchingArr) => {
            return Promise.all(searchingArr).then(() => {
                const nextSearchingArr = [];
                for (const country in archive) {
                    for (let i = 1; i < archive[country].borders.length; i++) {
                        if (archive[country].borders[i] === countriesData[toCountry.value].cca3) {
                            search = false;
                            console.log('ПРИЕХАЛИ!');
                        }
                        if (search && !archive[archive[country].borders[i]]) {
                            nextSearchingArr.push(
                                getCountrieData(archive[country].borders[i]).then((res) => {
                                    archive[archive[country].borders[i]] = res;
                                })
                            );
                            countOfRequests += 1;
                        }
                    }
                }
                countOfAttemps += 1;
                console.log(archive);
                console.log(countOfAttemps);
                console.log(countOfRequests);
                nextSearching = nextSearchingArr;
            });
        };

        const searchToCountry = async (fromCountryArr) => {
            await getBorders(fromCountryArr);
            while (search && countOfAttemps < 10) {
                await getBorders(nextSearching);
            }
            console.log(archive);
        };

        const fromCountrySearchingArr = [];

        fromCountrySearchingArr.push(
            getCountrieData(fromCountryValue).then((data) => {
                archive[fromCountryValue] = data;
            })
        );

        searchToCountry(fromCountrySearchingArr);

        // getCountrieData(fromCountryValue).then((data) => {
        //     archive[fromCountryValue] = data;

        // const searchingArr = [];
        // for (let i = 0; i < archive[fromCountryValue].borders.length; i++) {
        //     if (archive[fromCountryValue].borders[i] === toCountryValue) {
        //         search = false;
        //         console.log('ПРИЕХАЛИ!');
        //         break;
        //     }
        //     if (search) {
        //         searchingArr.push(
        //             getCountrieData(archive[fromCountryValue].borders[i]).then((res) => {
        //                 archive[archive[fromCountryValue].borders[i]] = res;
        //             })
        //         );
        //         countOfRequests += 1;
        //     }
        // }
        // countOfAttemps += 1;

        // for (let index = 0; index < 10; index++) {
        //     const searchingArr1 = [];
        //     Promise.all(searchingArr).then(() => {
        //         for (const country in archive) {
        //             for (let i = 1; i < archive[country].borders.length; i++) {
        //                 if (archive[country].borders[i] === countriesData[toCountry.value].cca3) {
        //                     search = false;
        //                     console.log('ПРИЕХАЛИ!');
        //                 }
        //                 if (search && !archive[archive[country].borders[i]]) {
        //                     searchingArr1.push(
        //                         getCountrieData(archive[country].borders[i]).then((res) => {
        //                             archive[archive[country].borders[i]] = res;
        //                         })
        //                     );
        //                     countOfRequests += 1;
        //                 }
        //             }
        //         }
        //         countOfAttemps += 1;
        //         console.log(archive);
        //         console.log(countOfAttemps);
        //         console.log(countOfRequests);
        //     });
        // }

        // const searchingArr1 = [];
        // Promise.all(searchingArr).then(() => {
        //     for (const country in archive) {
        //         for (let i = 1; i < archive[country].borders.length; i++) {
        //             if (archive[country].borders[i] === countriesData[toCountry.value].cca3) {
        //                 search = false;
        //                 console.log('ПРИЕХАЛИ!');
        //             }
        //             if (search && !archive[archive[country].borders[i]]) {
        //                 searchingArr1.push(
        //                     getCountrieData(archive[country].borders[i]).then((res) => {
        //                         archive[archive[country].borders[i]] = res;
        //                     })
        //                 );
        //                 countOfRequests += 1;
        //             }
        //         }
        //     }
        //     countOfAttemps += 1;
        //     console.log(archive);
        //     console.log(countOfAttemps);
        //     console.log(countOfRequests);
        // });
        // const searchingArr2 = [];
        // Promise.all(searchingArr1).then(() => {
        //     for (const country in archive) {
        //         for (let i = 1; i < archive[country].borders.length; i++) {
        //             if (archive[country].borders[i] === countriesData[toCountry.value].cca3) {
        //                 search = false;
        //                 console.log('ПРИЕХАЛИ!');
        //             }
        //             if (search && !archive[archive[country].borders[i]]) {
        //                 searchingArr2.push(
        //                     getCountrieData(archive[country].borders[i]).then((res) => {
        //                         archive[archive[country].borders[i]] = res;
        //                     })
        //                 );
        //                 countOfRequests += 1;
        //             }
        //         }
        //     }
        //     countOfAttemps += 1;
        //     console.log(archive);
        //     console.log(countOfAttemps);
        //     console.log(countOfRequests);
        // });
        // const searchingArr3 = [];
        // Promise.all(searchingArr2).then(() => {
        //     for (const country in archive) {
        //         for (let i = 1; i < archive[country].borders.length; i++) {
        //             if (archive[country].borders[i] === countriesData[toCountry.value].cca3) {
        //                 search = false;
        //                 console.log('ПРИЕХАЛИ!');
        //             }
        //             if (search && !archive[archive[country].borders[i]]) {
        //                 searchingArr3.push(
        //                     getCountrieData(archive[country].borders[i]).then((res) => {
        //                         archive[archive[country].borders[i]] = res;
        //                     })
        //                 );
        //                 countOfRequests += 1;
        //             }
        //         }
        //     }
        //     countOfAttemps += 1;
        //     console.log(archive);
        //     console.log(countOfAttemps);
        //     console.log(countOfRequests);
        // });
        // const searchingArr4 = [];
        // Promise.all(searchingArr3).then(() => {
        //     for (const country in archive) {
        //         for (let i = 1; i < archive[country].borders.length; i++) {
        //             if (archive[country].borders[i] === countriesData[toCountry.value].cca3) {
        //                 search = false;
        //                 console.log('ПРИЕХАЛИ!');
        //             }
        //             if (search && !archive[archive[country].borders[i]]) {
        //                 searchingArr4.push(
        //                     getCountrieData(archive[country].borders[i]).then((res) => {
        //                         archive[archive[country].borders[i]] = res;
        //                     })
        //                 );
        //                 countOfRequests += 1;
        //             }
        //         }
        //     }
        //     countOfAttemps += 1;
        //     console.log(archive);
        //     console.log(countOfAttemps);
        //     console.log(countOfRequests);
        // });
        // });
    });
})();
