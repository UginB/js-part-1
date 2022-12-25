async function getData(url) {
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

// eslint-disable-next-line consistent-return
async function getCountrieData(cca3, search) {
    if (search) {
        const countrieData = await getData(`https://restcountries.com/v3.1/alpha/${cca3}?fields=name&fields=borders`);
        return countrieData;
    }
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

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const fromCountryValue = countriesData[fromCountry.value].cca3;
        const toCountryValue = countriesData[toCountry.value].cca3;

        let search = true;
        let way = [];
        let countOfRequests = 1;
        let countOfAttemps = 0;
        let nextSearching;

        const getBorders = (searchingArr) => {
            const wayStep = {};

            return Promise.all(searchingArr).then(() => {
                const nextSearchingArr = [];

                for (const country in archive) {
                    for (let i = 1; i < archive[country].borders.length; i++) {
                        const countrieFromBorders = archive[country].borders[i];

                        // if (countrieFromBorders === toCountryValue) {
                        //     search = false;
                        //     console.log('ПРИЕХАЛИ!');
                        // }

                        if (search && !archive[countrieFromBorders]) {
                            nextSearchingArr.push(
                                // eslint-disable-next-line no-loop-func
                                getCountrieData(countrieFromBorders, search).then((res) => {
                                    archive[countrieFromBorders] = res;
                                    if (res.borders.includes(toCountryValue)) {
                                        search = false;
                                        console.log('ПРИЕХАЛИ!');
                                    }
                                    wayStep[countrieFromBorders] = [...res.borders];
                                })
                            );

                            countOfRequests += 1;
                        }
                    }
                }

                countOfAttemps += 1;
                way.push(wayStep);

                // console.log(archive);
                // console.log(countOfAttemps);
                // console.log(countOfRequests);
                // console.log(way);
                nextSearching = nextSearchingArr;
            });
        };

        const searchToCountry = async (fromCountryArr) => {
            await getBorders(fromCountryArr);

            while (search && countOfAttemps < 10) {
                // eslint-disable-next-line no-await-in-loop
                await getBorders(nextSearching);
            }

            way = way.reverse();
            const sortWay = [];

            for (let i = 0; i < way.length; i++) {
                sortWay.push({});
                for (const item in way[i]) {
                    if (i === 1 && way[i][item].includes(toCountryValue)) {
                        sortWay[i][item] = way[i][item];
                    } else {
                        // eslint-disable-next-line no-loop-func
                        way[i][item].forEach((country) => {
                            if (sortWay[i - 1][country]) {
                                sortWay[i][item] = way[i][item];
                            }
                        });
                    }
                }
            }

            const inputText = (output) => {
                const text = `${fromCountry.value} →${output} ${toCountry.value}`;
                return text;
            };

            let outputArr = [''];

            sortWay.reverse().forEach((country) => {
                const countryItem = Object.keys(country);

                if (countryItem.length === 1) {
                    outputArr = outputArr.map((item) => {
                        return (item += ` ${archive[countryItem[0]].name.common} →`);
                    });
                } else if (countryItem.length > 1) {
                    for (let i = 0; i < countryItem.length - 1; i++) {
                        outputArr.push(...outputArr);
                    }

                    let count = 0;
                    outputArr = outputArr.map((item, index) => {
                        if (index === outputArr.length / countryItem.length) {
                            count += 1;
                            console.log(index);
                        }

                        return (item += ` ${archive[countryItem[count]].name.common} →`);
                    });
                }
            });

            // console.log(countOfAttemps);
            // console.log(countOfRequests);
            // console.log(outputArr);

            outputArr.forEach((item) => {
                const paragraph = document.createElement('p');
                paragraph.textContent = inputText(item);
                output.appendChild(paragraph);
            });

            const countOfRequestsParagraph = document.createElement('p');
            countOfRequestsParagraph.textContent = `Понадобилось всего ${countOfRequests} запросов!`;
            output.appendChild(countOfRequestsParagraph);
        };

        const fromCountrySearchingArr = [];

        fromCountrySearchingArr.push(
            getCountrieData(fromCountryValue, search).then((data) => {
                archive[fromCountryValue] = data;
                if (data && data.borders.includes(toCountryValue)) {
                    search = false;
                    console.log('ПРИЕХАЛИ!');
                }
            })
        );

        searchToCountry(fromCountrySearchingArr);
    });
})();
