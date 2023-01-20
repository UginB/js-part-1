var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
function getData(url) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        redirect: 'follow'
                    })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
function loadCountriesData() {
    return __awaiter(this, void 0, void 0, function () {
        var countries;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getData('https://restcountries.com/v3.1/all?fields=name&fields=cca3&fields=area')];
                case 1:
                    countries = _a.sent();
                    return [2 /*return*/, countries.reduce(function (result, country) {
                            result[country.name.common] = country;
                            return result;
                        }, {})];
            }
        });
    });
}
function getCountryData(cca3) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getData("https://restcountries.com/v3.1/alpha/".concat(cca3, "?fields=name&fields=borders"))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var form = document.getElementById('form');
var fromCountry = document.getElementById('fromCountry');
var toCountry = document.getElementById('toCountry');
var countriesList = document.getElementById('countriesList');
var submit = document.getElementById('submit');
var output = document.getElementById('output');
var reset = document.getElementById('reset');
(function () { return __awaiter(_this, void 0, void 0, function () {
    var countriesData, archive, search, way, countOfRequests, countOfAttemps, nextSearching, createText, createError, searchNeighbors, getBorders, searchToCountry;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fromCountry.disabled = true;
                toCountry.disabled = true;
                submit.disabled = true;
                reset.disabled = true;
                output.textContent = 'Loading…';
                return [4 /*yield*/, loadCountriesData()];
            case 1:
                countriesData = _a.sent();
                output.textContent = '';
                // Заполняем список стран для подсказки в инпутах
                Object.keys(countriesData)
                    .sort(function (a, b) { return countriesData[b].area - countriesData[a].area; })
                    .forEach(function (code) {
                    var option = document.createElement('option');
                    option.value = countriesData[code].name.common;
                    countriesList.appendChild(option);
                });
                fromCountry.disabled = false;
                toCountry.disabled = false;
                submit.disabled = false;
                reset.disabled = false;
                reset.addEventListener('click', function (event) {
                    event.preventDefault();
                    fromCountry.value = '';
                    toCountry.value = '';
                    output.innerHTML = '';
                    fromCountry.style.backgroundColor = '';
                    toCountry.style.backgroundColor = '';
                });
                search = true;
                way = [];
                countOfRequests = 1;
                countOfAttemps = 0;
                createText = function (innerText) {
                    var elem = document.createElement('p');
                    elem.textContent = innerText;
                    output.appendChild(elem);
                };
                createError = function (innerText) {
                    var elem = document.createElement('p');
                    elem.textContent = innerText;
                    elem.style.color = 'red';
                    output.appendChild(elem);
                };
                searchNeighbors = function (cca3, toCountryCode, firstIteration, wayStep) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                countOfRequests += 1;
                                return [4 /*yield*/, getCountryData(cca3)
                                        .then(function (res) {
                                        archive[cca3] = res;
                                        if (res.borders.includes(toCountryCode)) {
                                            search = false;
                                        }
                                        if (!firstIteration && wayStep) {
                                            wayStep[cca3] = __spreadArray([], res.borders, true);
                                        }
                                    })["catch"](function (e) {
                                        search = false;
                                        createError("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E \u0441\u0442\u043E\u0440\u043E\u043D\u044B \u0441\u0435\u0440\u0432\u0435\u0440\u0430. ".concat(e.message, " \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u0438\u043B\u0438 \u0437\u0430\u0439\u0442\u0438 \u043F\u043E\u0437\u0436\u0435."));
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                getBorders = function (nextSearchPromises, toCountryCode) {
                    // массив для сбора соседей соседей
                    var wayStep = {};
                    return Promise.all(nextSearchPromises)
                        .then(function () {
                        // массив для сбора соседей соседей для следующего поиска, если в этой итерации toCountry не найдется
                        var nextSearchingArr = [];
                        for (var country in archive) {
                            for (var i = 1; i < archive[country].borders.length; i++) {
                                var countryFromBorders = archive[country].borders[i];
                                if (search && !archive[countryFromBorders]) {
                                    nextSearchingArr.push(searchNeighbors(countryFromBorders, toCountryCode, false, wayStep));
                                }
                            }
                        }
                        countOfAttemps += 1;
                        way.push(wayStep);
                        nextSearching = nextSearchingArr;
                    })["catch"](function (e) {
                        search = false;
                        createError("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E \u0441\u0442\u043E\u0440\u043E\u043D\u044B \u0441\u0435\u0440\u0432\u0435\u0440\u0430. ".concat(e.message, " \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u0438\u043B\u0438 \u0437\u0430\u0439\u0442\u0438 \u043F\u043E\u0437\u0436\u0435."));
                    });
                };
                searchToCountry = function (fromCountryArr, toCountryCode) { return __awaiter(_this, void 0, void 0, function () {
                    var sortWay, _loop_1, i, outputArr, inputText;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getBorders(fromCountryArr, toCountryCode)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                if (!(search && countOfAttemps < 10)) return [3 /*break*/, 4];
                                // eslint-disable-next-line no-await-in-loop
                                return [4 /*yield*/, getBorders(nextSearching, toCountryCode)];
                            case 3:
                                // eslint-disable-next-line no-await-in-loop
                                _a.sent();
                                return [3 /*break*/, 2];
                            case 4:
                                way = way.reverse();
                                sortWay = [];
                                _loop_1 = function (i) {
                                    sortWay.push({});
                                    var _loop_2 = function (item) {
                                        if (i === 1 && way[i][item].includes(toCountryCode)) {
                                            sortWay[i][item] = way[i][item];
                                        }
                                        else {
                                            // eslint-disable-next-line no-loop-func
                                            way[i][item].forEach(function (country) {
                                                if (sortWay[i - 1][country]) {
                                                    sortWay[i][item] = way[i][item];
                                                }
                                            });
                                        }
                                    };
                                    for (var item in way[i]) {
                                        _loop_2(item);
                                    }
                                };
                                // сортируем наш путь, и оставляем только непосредственно страны, через которые пойдем от fromCountry до
                                for (i = 0; i < way.length; i++) {
                                    _loop_1(i);
                                }
                                outputArr = [''];
                                // Преобразуем массив пути в текст/ текста (если маршрут можно проложить несколькими способами)
                                sortWay.reverse().forEach(function (country) {
                                    var countryItem = Object.keys(country);
                                    console.log(countryItem);
                                    if (countryItem.length === 1) {
                                        outputArr = outputArr.map(function (item) {
                                            return (item += " ".concat(archive[countryItem[0]].name.common, " \u2192"));
                                        });
                                    }
                                    else if (countryItem.length > 1) {
                                        for (var i = 0; i < countryItem.length - 1; i++) {
                                            outputArr.push.apply(outputArr, outputArr);
                                        }
                                        var count_1 = 0;
                                        outputArr = outputArr.map(function (item, index) {
                                            if (index === outputArr.length / countryItem.length) {
                                                count_1 += 1;
                                            }
                                            return (item += " ".concat(archive[countryItem[count_1]].name.common, " \u2192"));
                                        });
                                    }
                                });
                                inputText = function (output) {
                                    var text = "".concat(fromCountry.value, " \u2192").concat(output, " ").concat(toCountry.value);
                                    return text;
                                };
                                output.textContent = '';
                                outputArr.forEach(function (item) {
                                    createText(inputText(item));
                                });
                                createText("\u041F\u043E\u043D\u0430\u0434\u043E\u0431\u0438\u043B\u043E\u0441\u044C \u0432\u0441\u0435\u0433\u043E ".concat(countOfRequests, " \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432!"));
                                if (outputArr.length < 9 && countOfAttemps === 10) {
                                    createText("\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0434\u0430\u043B\u0435\u043A\u043E!");
                                }
                                return [2 /*return*/];
                        }
                    });
                }); };
                form.addEventListener('submit', function (event) {
                    event.preventDefault();
                    fromCountry.disabled = true;
                    toCountry.disabled = true;
                    submit.disabled = true;
                    reset.disabled = true;
                    output.textContent = '';
                    var fromCountryCode;
                    var toCountryCode;
                    try {
                        fromCountry.style.backgroundColor = '';
                        fromCountryCode = countriesData[fromCountry.value].cca3;
                    }
                    catch (_a) {
                        fromCountry.style.backgroundColor = 'red';
                        createError("\u041D\u0435\u0432\u0435\u0440\u043D\u043E \u0443\u043A\u0430\u0437\u0430\u043D\u0430 \u043D\u0430\u0447\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u0440\u0430\u043D\u0430!");
                    }
                    try {
                        toCountry.style.backgroundColor = '';
                        toCountryCode = countriesData[toCountry.value].cca3;
                    }
                    catch (_b) {
                        toCountry.style.backgroundColor = 'red';
                        createError("\u041D\u0435\u0432\u0435\u0440\u043D\u043E \u0443\u043A\u0430\u0437\u0430\u043D\u0430 \u043A\u043E\u043D\u0435\u0447\u043D\u0430\u044F \u0441\u0442\u0440\u0430\u043D\u0430!");
                    }
                    var error = false;
                    if (!fromCountryCode || !toCountryCode) {
                        error = true;
                    }
                    if (fromCountryCode && toCountryCode && fromCountryCode === toCountryCode) {
                        error = true;
                        output.textContent = 'Начальная и конечная страна совпадают! Введите разные страны для поиска пути!';
                    }
                    if (!error && fromCountryCode && toCountryCode) {
                        output.textContent = 'Ищем самый короткий путь! Подождите, пожалуйста!';
                        var fromCountrySearchingArr = [];
                        // ищем toCountry на основании массива соседей fromCountry
                        fromCountrySearchingArr.push(searchNeighbors(fromCountryCode, toCountryCode, true));
                        searchToCountry(fromCountrySearchingArr, toCountryCode);
                        archive = {};
                        search = true;
                        way = [];
                        countOfRequests = 1;
                        countOfAttemps = 0;
                    }
                    fromCountry.disabled = false;
                    toCountry.disabled = false;
                    submit.disabled = false;
                    reset.disabled = false;
                });
                return [2 /*return*/];
        }
    });
}); })();
