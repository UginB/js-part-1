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
async function getCountryData(cca3) {
    const countryData = await getData(`https://restcountries.com/v3.1/alpha/${cca3}?fields=name&fields=borders`);
    return countryData;
}

const form = document.getElementById('form');
const fromCountry = document.getElementById('fromCountry');
const toCountry = document.getElementById('toCountry');
const countriesList = document.getElementById('countriesList');
const submit = document.getElementById('submit');
const output = document.getElementById('output');
const reset = document.getElementById('reset');

(async () => {
    fromCountry.disabled = true;
    toCountry.disabled = true;
    submit.disabled = true;
    reset.disabled = true;

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
    reset.disabled = false;

    reset.addEventListener('click', (event) => {
        event.preventDefault();
        fromCountry.value = '';
        toCountry.value = '';
        output.innerHTML = '';
        fromCountry.style.backgroundColor = '';
        toCountry.style.backgroundColor = '';
    });

    let archive = {};
    let search = true;
    let way = [];
    let countOfRequests = 0;
    let countOfAttemps = 0;
    let nextSearching;

    const createText = (innerText) => {
        const elem = document.createElement('p');
        elem.textContent = innerText;
        output.appendChild(elem);
    };

    const createError = (innerText) => {
        const elem = document.createElement('p');
        elem.textContent = innerText;
        elem.style.color = 'red';
        output.appendChild(elem);
    };

    const searchNeighbors = async (cca3, toCountryCode, firstIteration, wayStep) => {
        await getCountryData(cca3)
            .then((res) => {
                archive[cca3] = res;
                if (res.borders.includes(toCountryCode)) {
                    search = false;
                }
                if (!firstIteration) {
                    wayStep[cca3] = [...res.borders];
                }
            })
            .catch((e) => {
                search = false;
                createError(
                    `Ошибка со стороны сервера. ${e.message} Попробуйте перезагрузить страницу или зайти позже.`
                );
            });
        countOfRequests += 1;
    };

    // функция для поиска соседей соседей и закидывания их в архив
    const getBorders = (nextSearchPromises, toCountryCode) => {
        // массив для сбора соседей соседей
        const wayStep = {};

        return Promise.all(nextSearchPromises)
            .then(() => {
                // массив для сбора соседей соседей для следующего поиска, если в этой итерации toCountry не найдется
                const nextSearchingArr = [];

                for (const country in archive) {
                    for (let i = 1; i < archive[country].borders.length; i++) {
                        const countryFromBorders = archive[country].borders[i];

                        if (search && !archive[countryFromBorders]) {
                            nextSearchingArr.push(searchNeighbors(countryFromBorders, toCountryCode, false, wayStep));
                        }
                    }
                }

                countOfAttemps += 1;
                way.push(wayStep);
                nextSearching = nextSearchingArr;
            })
            .catch((e) => {
                search = false;
                createError(
                    `Ошибка со стороны сервера. ${e.message} Попробуйте перезагрузить страницу или зайти позже.`
                );
            });
    };

    const searchToCountry = async (fromCountryArr, toCountryCode) => {
        await getBorders(fromCountryArr, toCountryCode);
        // углубляемся в соседей соседей, пока не найдем toCountry или колисчество попыток не дойжет до 10
        while (search && countOfAttemps < 10) {
            // eslint-disable-next-line no-await-in-loop
            await getBorders(nextSearching);
        }

        way = way.reverse();
        const sortWay = [];

        // сортируем наш путь, и оставляем только непосредственно страны, через которые пойдем от fromCountry до

        for (let i = 0; i < way.length; i++) {
            sortWay.push({});
            for (const item in way[i]) {
                if (i === 1 && way[i][item].includes(toCountryCode)) {
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

        let outputArr = [''];

        // Преобразуем массив пути в текст/ текста (если маршрут можно проложить несколькими способами)
        sortWay.reverse().forEach((country) => {
            const countryItem = Object.keys(country);
            console.log(countryItem);
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
                    }

                    return (item += ` ${archive[countryItem[count]].name.common} →`);
                });
            }
        });

        const inputText = (output) => {
            const text = `${fromCountry.value} →${output} ${toCountry.value}`;
            return text;
        };

        output.textContent = '';

        outputArr.forEach((item) => {
            createText(inputText(item));
        });

        createText(`Понадобилось всего ${countOfRequests} запросов!`);

        if (outputArr.length < 9 && countOfAttemps === 10) {
            createText(`Слишком далеко!`);
        }
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        fromCountry.disabled = true;
        toCountry.disabled = true;
        submit.disabled = true;
        reset.disabled = true;

        output.textContent = '';
        let fromCountryCode;
        let toCountryCode;
        try {
            fromCountry.style.backgroundColor = '';
            fromCountryCode = countriesData[fromCountry.value].cca3;
        } catch {
            fromCountry.style.backgroundColor = 'red';
            createError(`Неверно указана начальная страна!`);
        }
        try {
            toCountry.style.backgroundColor = '';
            toCountryCode = countriesData[toCountry.value].cca3;
        } catch {
            toCountry.style.backgroundColor = 'red';
            createError(`Неверно указана конечная страна!`);
        }

        let error = false;
        if (!fromCountryCode || !toCountryCode) {
            error = true;
        }

        if (fromCountryCode && toCountryCode && fromCountryCode === toCountryCode) {
            error = true;
            output.textContent = 'Начальная и конечная страна совпадают! Введите разные страны для поиска пути!';
        }

        if (!error) {
            output.textContent = 'Ищем самый короткий путь! Подождите, пожалуйста!';

            const fromCountrySearchingArr = [];

            // ищем toCountry на основании массива соседей fromCountry
            fromCountrySearchingArr.push(searchNeighbors(fromCountryCode, toCountryCode, true));

            searchToCountry(fromCountrySearchingArr, toCountryCode);

            archive = {};
            search = true;
            way = [];
            countOfRequests = 0;
            countOfAttemps = 0;
        }
        fromCountry.disabled = false;
        toCountry.disabled = false;
        submit.disabled = false;
        reset.disabled = false;
    });
})();
