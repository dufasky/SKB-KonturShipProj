//добавить проверку на регистр товаров
//проверку на целый товар 
//проверку на систему счисления товара


let dataGame = {
    'gameStateCopy': {}, //Копия объекта gameStart
    'levelMapCustom': [], //Кастомная карта с цифрами
    'sizeMap': {}, //Размер карты по x и y
    'levelMapCustomArr': [], //Многомерный массив с кастомной картой
    'levelMapBarriers': [], //Массив с координатами препятствий

    'counter': 0, //Счетчик ходов игры
};

let dataShip = {
    'shipVolume': 368, //Объем корабля
    'setPosition': {}, //Текущая позиция корабля на каждом шаге
    'positionComm': "", //Строка, которая будет содержать N,W,S,E
    'itemOnShipArr': [], //Товары на корабле
};

let dataPirate = {
    'positionPirates': [], //Текущая позиция пиарата
    'customSizePirate': [], //Кастомный размер пирата для текущей позиции
};

let dataItem = {
    'customPrices': [], //Кастомный прайс
    'createCustPriceXY': [], //Кастомный прайс с координатами
    'priorityAllItem': [], //Расстановка приоритетов
    'bestItem': {}, //Лучший товар в порту
    'bestForEachPort': [], //Лучший товар в каждом порту (портов > 2)
    'bestItems': [],
    'bestPortOnlyObj': {},
    'bestPortOnly': [],
};

let dataPorts = {
    'quantityOfPors': 0, //Количество портов на уровне
    'homePort': {}, //Координаты домашнего порта
    'finishPoint': {}, //Точка в которую нужно держать путь
    'wayLength': 0, //Массив с длинной пути до портов
};




function calculatePath(current, destinationX, destinationY, map) {
    let Node = function (x, y, cost, parent) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.cost = cost; 
        this.h = (Math.abs(this.x - destinationX) + Math.abs(this.y - destinationY)) * 10; // Heuristic (Manhattan method) cost to reach dest.
        this.score = this.cost + (this.parent != null ? this.parent.score : 0) + this.h;
    }

    let path = [];
    let openList = [];
    let closedList = [];
    let resultNode = null;
    let nowNode;
    let x, y;
    let cost = 0;
    let inListNode = null;
    let node = null;
    let nowNodeIdx;

    openList.push(new Node(current.x, current.y, 0, null));

    // while exist not found or there are nodes to visit
    while (openList.length > 0) {
        nowNodeIdx = 0;
        nowNode = openList[nowNodeIdx];

        for (let j in openList) {
            if (nowNode.score > openList[j].score) {
                nowNode = openList[j];
                nowNodeIdx = j;
            }
        }

        openList.splice(nowNodeIdx, 1);
        closedList[nowNode.x + "-" + nowNode.y] = 1;

        // for all adjacent node
        //? Аналзиз клеток вокруг коробля
        for (let i = 0; i < 4; i++) {

            if (i == 0) {
                x = 0;
                y = -1;
            } else if (i == 1) {
                x = 1;
                y = 0;
            } else if (i == 2) {
                x = 0;
                y = 1;
            } else if (i == 3) {
                x = -1;
                y = 0;
            } else if (i == 4) {
                x = -1;
                y = -1;
            } else if (i == 5) {
                x = 1;
                y = -1;
            } else if (i == 6) {
                x = -1;
                y = 1;
            } else if (i == 7) {
                x = 1;
                y = 1;
            }

            // if the node isn't an objstacle or part of closed list
            cost = map.getWalkableCost(nowNode.x + x, nowNode.y + y);
            if (cost != -1 && closedList[(nowNode.x + x) + "-" + (nowNode.y + y)] == null) {
                node = new Node(nowNode.x + x, nowNode.y + y, cost + (i > 3 ? 4 : 0), nowNode);
                inListNode = null;

                for (let j in openList) {
                    if (openList[j].x == node.x && openList[j].y == node.y) {
                        inListNode = openList[j];
                        break;
                    }
                }

                if (inListNode == null) {
                    openList.push(node);
                } else {
                    if (node.score < inListNode.score) {
                        inListNode = node;
                    }
                }

                // Проверка на достижимость конечной точки
                if (Math.abs(node.x - destinationX) < 1 && Math.abs(node.y - destinationY) < 1) {
                    resultNode = node;
                    break;
                }
            }
        }

        if (resultNode != null) {
            break;
        }
    }

    // If the resultNod exists, backtrack and create a path
    if (resultNode != null) {
        path.unshift(resultNode);

        while (resultNode.parent != null) {
            resultNode = resultNode.parent;
            path.unshift(resultNode);
        }
    }
    dataPorts.wayLength = path.length;
    return path;
}

function pathfinder() {
    class Map {
        constructor(width, height) {
            this.maze = [];

            for (let i = 0; i < width; i++) {
                this.maze[i] = new Array();
                for (let j = 0; j < height; j++) {
                    this.maze[i].push(0);
                }
            }

            // Добавляем рамку 
            for (let i = 0; i < width; i++) {
                this.maze[i][0] = 1;
                this.maze[i][height - 1] = 1;
            }

            for (let j = 0; j < height; j++) {
                this.maze[0][j] = 1;
                this.maze[width - 1][j] = 1;
            }

            // Добавляем барьеры c карты 
            for (let i in dataGame.levelMapBarriers) {
                let barrierX = dataGame.levelMapBarriers[i].x + 1,
                    barrierY = dataGame.levelMapBarriers[i].y + 1;
                this.maze[barrierX][barrierY] = "1";
            }

            // Добавляем пирата
            for (let i in dataPirate.customSizePirate) {
                for (let k in dataPirate.customSizePirate[i]) {
                    if (k <= 5) {
                        this.maze[dataPirate.customSizePirate[i][k].x][dataPirate.customSizePirate[i][k].y] = 10;
                    }
                }
            }

            this.finishPoint = {
                x: dataPorts.finishPoint.x + 1,
                y: dataPorts.finishPoint.y + 1
            }; //Конечная точка
        }

        // касты пути
        getWalkableCost(x, y) {
            if (this.maze[x][y] != 1 && this.maze[x][y] != 10) {
                return 10;
            } else if (this.maze[x][y] == 1 && this.maze[x][y] != 10) {
                return -1;
            } else if (this.maze[x][y] != 1 && this.maze[x][y] == 10) {
                return 5000;
            }
        }
    }

    for (let i in dataPirate.positionPirates) {
        let piratXY = {
            x: dataPirate.positionPirates[i].x,
            y: dataPirate.positionPirates[i].y
        };

        let piratX1Y = {
            x: piratXY.x + 1,
            y: piratXY.y
        }; //вправо
        let piratX_1Y = {
            x: piratXY.x - 1,
            y: piratXY.y
        }; // влево
        let piratXY1 = {
            x: piratXY.x,
            y: piratXY.y + 1
        }; //наверх
        let piratXY_1 = {
            x: piratXY.x,
            y: piratXY.y - 1
        }; //вниз

        dataPirate.customSizePirate.push([piratXY, piratX1Y, piratX_1Y, piratXY1, piratXY_1]);
    }

    let width = dataGame.sizeMap.x,
        height = dataGame.sizeMap.y;
    let map = new Map(width + 2, height + 2); // + 2 - барьеры вокруг карты, тогда все координаты будут x + 1 и y + 1;
    let path = [];
    let loc = {
        x: dataShip.setPosition.x,
        y: dataShip.setPosition.y
    };

    function find() { //
        if (loc.x != map.finishPoint.x || loc.y != map.finishPoint.y) {
            if (path.length == 0) {
                path = calculatePath(loc, map.finishPoint.x, map.finishPoint.y, map);

                if (path != false) {
                    let pathNew = path;
                    let lastNode = {
                        x: path[path.length - 1].x,
                        y: path[path.length - 1].y
                    };

                    pathNew.shift();
                    pathNew.push(lastNode);

                    if (dataShip.setPosition.x < pathNew[0].x && dataShip.setPosition.y == pathNew[0].y) {
                        dataShip.positionComm = "E";
                    } else if (dataShip.setPosition.x > pathNew[0].x && dataShip.setPosition.y == pathNew[0].y) {
                        dataShip.positionComm = "W";
                    } else if (dataShip.setPosition.y < pathNew[0].y && dataShip.setPosition.x == pathNew[0].x) {
                        dataShip.positionComm = "S";
                    } else if (dataShip.setPosition.y > pathNew[0].y && dataShip.setPosition.x == pathNew[0].x) {
                        dataShip.positionComm = "N";
                    } else {

                        let dir = path.shift();

                        loc.x = dir.x;
                        loc.y = dir.y;
                    }
                } else {
                    dataShip.positionComm = "WAIT";
                }
            }
        }
    }
    find();
}

//Поиск пути с препятствиями до портов
function findWayBarrier(xPoint, yPoint) {
    dataShip.setPosition = {
        x: dataPorts.homePort.x + 1,
        y: dataPorts.homePort.y + 1
    };
    dataPorts.finishPoint = {
        x: xPoint,
        y: yPoint
    }; //+1 не нужно
    pathfinder();
}


//Расставление приоритетов товаров 
function addPriorForItem() {
    let bestItemObj = {};

    for (let i in dataItem.createCustPriceXY) {
        let konkretTovar = dataItem.createCustPriceXY[i];
        let arrNotDelet = [];
        for (let h in dataGame.gameStateCopy.goodsInPort) {
            for (let z in dataItem.createCustPriceXY[i]) {
                if (dataGame.gameStateCopy.goodsInPort[h].name == konkretTovar[z].name) {
                    let tovars = {
                        name: dataItem.createCustPriceXY[i][z].name,
                        cost: dataItem.createCustPriceXY[i][z].cost,
                        x: dataItem.createCustPriceXY[i][z].x,
                        y: dataItem.createCustPriceXY[i][z].y
                    };
                    let objBlue = {
                        name: dataGame.gameStateCopy.goodsInPort[h].name,
                        amount: dataGame.gameStateCopy.goodsInPort[h].amount,
                        volume: dataGame.gameStateCopy.goodsInPort[h].volume
                    };

                    let itemX,
                        itemY;

                    for (let x in dataGame.gameStateCopy.ports) {
                        if (konkretTovar[0].cost == dataGame.gameStateCopy.ports[x].portId) {
                            itemX = dataGame.gameStateCopy.ports[x].x;
                            itemY = dataGame.gameStateCopy.ports[x].y;
                        }
                    }
                    findWayBarrier(itemX, itemY);
                    if (dataPorts.wayLength == 0) { //если порт не достижим (путь = 0) ставим расстояние = 999
                        dataPorts.wayLength = 999;
                    }
                    let calcBestItem = parseInt(dataShip.shipVolume / objBlue.volume) * tovars.cost / (dataPorts.wayLength - 1);
                    if (dataGame.gameStateCopy.goodsInPort[h].amount != 0) {
                        bestItemObj = {
                            portId: konkretTovar[0].cost,
                            name: tovars.name,
                            cost: tovars.cost,
                            x: tovars.x,
                            y: tovars.y,
                            priorityCalc: Number(calcBestItem.toFixed(4)),
                            volume: dataGame.gameStateCopy.goodsInPort[h].volume,
                            amount: dataGame.gameStateCopy.goodsInPort[h].amount
                        };
                        arrNotDelet.push(bestItemObj);
                    }
                }
            }
        }
        dataItem.priorityAllItem.push(arrNotDelet);

    }
    sortPriority(dataItem.priorityAllItem); //сортировка по большей выгодности 
}

function sortPriority(arr) {
    for (let i in arr) {
        arr[i].sort((a, b) => a.priorityCalc < b.priorityCalc ? 1 : -1);
    }
}

//сортировка по приорити
function findBestItem(allItemPrority) {
    let bestCount = 0;
    for (let i in allItemPrority) {
        for (let k in allItemPrority[i]) {
            if (allItemPrority[i][k].priorityCalc > bestCount && allItemPrority[i][k].amount != 0) {
                bestCount = allItemPrority[i][k].priorityCalc;
                dataItem.bestItem = allItemPrority[i][k];
            }
        }
    }
}

//Для нескольких портов
function multiplyPort(arrAllPriority) {
    for (let i in arrAllPriority) {
        let shipVolumeAnalys = 368;
        let arrPush = [];
        let objectP = {};
        let amountK = 0;
        for (let k in arrAllPriority[i]) {
            if (arrAllPriority[i][k].amount != 0) {
                if (shipVolumeAnalys >= arrAllPriority[i][k].volume) {
                    if (arrAllPriority[i][k].amount < parseInt(shipVolumeAnalys / arrAllPriority[i][k].volume)) {
                        amountK = arrAllPriority[i][k].amount;
                        findBestItem(arrAllPriority[i][k].x, arrAllPriority[i][k].y);
                        if (arrPush.length == 0) {
                            objectP = (arrAllPriority[i][k].cost * amountK) / ((dataPorts.wayLength - 1) * 2 + 2);
                            shipVolumeAnalys -= amountK * arrAllPriority[i][k].volume;
                            arrAllPriority[i][k].amountMulti = amountK;
                            arrPush.push(arrAllPriority[i][k]);
                        } else {
                            if (objectP < (arrAllPriority[i][k].cost * amountK / 2)) {
                                shipVolumeAnalys -= amountK * arrAllPriority[i][k].volume;
                                arrAllPriority[i][k].amountMulti = amountK;
                                arrPush.push(arrAllPriority[i][k]);
                            }
                        }
                    } else {
                        amountK = parseInt(shipVolumeAnalys / arrAllPriority[i][k].volume);
                        findBestItem(arrAllPriority[i][k].x, arrAllPriority[i][k].y);
                        if (arrPush.length == 0) {
                            objectP = (arrAllPriority[i][k].cost * amountK) / ((dataPorts.wayLength - 1) * 2 + 2);
                            shipVolumeAnalys -= amountK * arrAllPriority[i][k].volume;
                            arrAllPriority[i][k].amountMulti = amountK;
                            arrPush.push(arrAllPriority[i][k]);
                        } else {
                            if (objectP < (arrAllPriority[i][k].cost * amountK / 2)) {
                                shipVolumeAnalys -= amountK * arrAllPriority[i][k].volume;
                                arrAllPriority[i][k].amountMulti = amountK;
                                arrPush.push(arrAllPriority[i][k]);
                            }
                        }
                    }
                }
            }
        }
        dataItem.bestItems.push(arrPush);
    }
}

//находит лучший порт из пачки
function findBestMulti(arrdataItem) {
    for (let i in arrdataItem) {
        let summary = 0;
        let result = 0;
        let portResult = {};
        let lengthK = 0;
        let bestPort = {};

        for (let k in arrdataItem[i]) {
            summary += arrdataItem[i][k].cost * arrdataItem[i][k].amountMulti;
            portResult = {
                portId: arrdataItem[i][k].portId,
                x: arrdataItem[i][k].x,
                y: arrdataItem[i][k].y
            };
            lengthK = arrdataItem[i].length;
        }
        findWayBarrier(portResult.x, portResult.y);
        if (dataPorts.wayLength == 0) {
            dataPorts.wayLength = 999;
        }
        result = summary / ((dataPorts.wayLength - 1) * 2 + lengthK * 2)
        bestPort = {
            portId: portResult.portId,
            x: portResult.x,
            y: portResult.y,
            resultWay: result,
            pathLength: dataPorts.wayLength - 1,
        };
        dataItem.bestPortOnly.push(bestPort);
    }

    let bestCount = 0;
    for (let i in dataItem.bestPortOnly) {
        if (dataItem.bestPortOnly[i].resultWay > bestCount) {
            bestCount = dataItem.bestPortOnly[i].resultWay;
            dataItem.bestPortOnlyObj = dataItem.bestPortOnly[i];
        }

    }
}

//последний порт 
function findBestMultiLast(arrdataItem) {
    dataItem.bestPortOnly = [];
    dataItem.bestPortOnlyObj = {}

    for (let i in arrdataItem) {
        let summary = 0;
        let result = 0;
        let portResult = {};
        let lengthK = 0;
        let bestPort = {};

        for (let k in arrdataItem[i]) {
            summary += arrdataItem[i][k].cost * arrdataItem[i][k].amountMulti;
            portResult = {
                portId: arrdataItem[i][k].portId,
                x: arrdataItem[i][k].x,
                y: arrdataItem[i][k].y
            };
            lengthK = arrdataItem[i].length;
        }
        findWayBarrier(portResult.x, portResult.y);

        if (dataPorts.wayLength == 0) {
            dataPorts.wayLength = 999;
        }
        result = summary / ((dataPorts.wayLength - 1) * 2 + lengthK * 2)
        bestPort = {
            portId: portResult.portId,
            x: portResult.x,
            y: portResult.y,
            resultWay: result,
            pathLength: dataPorts.wayLength - 1,
        };
        dataItem.bestPortOnly.push(bestPort);
    }

    let bestCount = 0;

    for (let i in dataItem.bestPortOnly) {

        if (dataItem.bestPortOnly[i].pathLength < bestCount || bestCount == 0) {
            bestCount = dataItem.bestPortOnly[i].pathLength;
            dataItem.bestPortOnlyObj = dataItem.bestPortOnly[i];
        }
    }
}

// вычетает 
function amountMinus(item, amountLoad) {
    for (let i in dataItem.priorityAllItem) {
        for (let k in dataItem.priorityAllItem[i]) {

            if (dataItem.priorityAllItem[i][k].name == item.name) {
                dataItem.priorityAllItem[i][k].amount -= amountLoad;
            }
        }
    }
}
// сначала отсортировали по лучшим все товары  в каждом порту
// нашли лучшие пачки для каждого порта 
// из 1 функции вычитает что мы взяли (для последующих новых пачек. вычитает товары которые катали в товарный первый раз)

export function startGame(levelMap, gameState) {

    //обнуление данных на начало уровней
    dataGame.gameStateCopy = {};
    dataShip.setPosition = {};
    dataGame.sizeMap = {};
    dataPorts.homePort = {};
    dataPorts.finishPoint = {};
    dataItem.bestItem = {};
    dataItem.bestPortOnlyObj = {};
    dataGame.levelMapCustom = [];
    dataGame.levelMapCustomArr = [];
    dataGame.levelMapBarriers = [];
    dataPirate.customSizePirate = [];
    dataPirate.positionPirates = [];
    dataItem.customPrices = [];
    dataItem.createCustPriceXY = [];
    dataItem.priorityAllItem = [];
    dataItem.bestForEachPort = [];
    dataItem.bestItems = [];
    dataItem.bestPortOnly = [];
    dataShip.itemOnShipArr = [];
    dataPorts.wayLength = [];
    dataShip.positionComm = "";
    dataPorts.quantityOfPors = 0;
    dataGame.counter = 0;
    countMove = 0;
    dataShip.shipVolume = 368;
    dataGame.gameStateCopy = gameState;
    //обнуление данных на начало уровней

    let functionData = {

        //Операции с картой
        mapCustomCalc: function () {
            for (let i in levelMap) {

                let mapSizeSign = levelMap[i]; //Каждый символ строки из карты

                //Замена (преобразование в кастомный вид)
                //0 - Вода
                //1 - Порт(ы)
                //2 - Земля (ограждение)
                //3 - Домашний порт

                if (mapSizeSign == "#") {
                    dataGame.levelMapCustom += 2;
                } else if (mapSizeSign == "~") {
                    dataGame.levelMapCustom += 0;
                } else if (mapSizeSign == "O") {
                    dataGame.levelMapCustom += 1;
                } else if (mapSizeSign == "H") {
                    dataGame.levelMapCustom += 3;
                } else {
                    dataGame.levelMapCustom += mapSizeSign;
                }
            }
            functionData.createMapCustArr(dataGame.levelMapCustom, functionData.calcMapSize());
            functionData.findBarrier(dataGame.levelMapCustomArr);
        },

        //удаление переносов строки + размер карты
        calcMapSize: function () {
            let mapSizeY = levelMap.split('\n').length, //Расчет размерности карты по y
                mapSizeX = (levelMap.length - (mapSizeY - 1)) / mapSizeY; //Расчет размерности карты по x
            dataGame.sizeMap = {
                x: mapSizeX,
                y: mapSizeY
            };
            return dataGame.sizeMap;
        },


        //удаление пробелов (запаковка карты в массив)
        createMapCustArr: function (mapString, mapSize) {
            let arr = mapString.split('')
            let subarr = [];

            for (let i = 0; i <= arr.length; i++) {
                if (arr[i] == '\n' && subarr.length > 0 || (i == arr.length && subarr.length > 0)) {
                    dataGame.levelMapCustomArr.push(subarr);
                    subarr = [];
                }
                subarr.push(arr[i]);
            }

            for (let j in dataGame.levelMapCustomArr) {
                if (dataGame.levelMapCustomArr[j].length > mapSize.x) {
                    dataGame.levelMapCustomArr[j].splice(0, 1);
                }
            }

            return dataGame.levelMapCustomArr;
        },

        //функция поиска барьеров
        findBarrier: function (mapArr) {
            for (let i = 0; i < mapArr.length; i++) {
                for (let k = 0; k < mapArr[i].length; k++) {

                    if (mapArr[i][k] == 2) {
                        dataGame.levelMapBarriers.push({
                            x: k,
                            y: i
                        });
                    }
                }
            }
        },

        //Операции с товарами
        extractPrices: function () {
            for (let i in dataGame.gameStateCopy.prices) {
                let prices = dataGame.gameStateCopy.prices[i];
                let keyPrices = [];

                for (let key in prices) {
                    keyPrices.push({
                        name: key,
                        cost: prices[key]
                    });
                }
                dataItem.customPrices.push(keyPrices); //Преобразование массива gameState.price в массив с объектами
            }
            functionData.createCustPriceXY(dataItem.customPrices);
        },

        //создание прайсов + координаты портов
        createCustPriceXY: function (itemArr) {
            let subArr = [];
            for (let i in dataGame.gameStateCopy.ports) {
                for (let k in itemArr) {
                    for (let h in itemArr[k]) {
                        if (dataGame.gameStateCopy.ports[i].portId == itemArr[k][0].cost) {
                            let createCustPriceXY = {
                                name: itemArr[k][h].name,
                                cost: itemArr[k][h].cost,
                                x: dataGame.gameStateCopy.ports[i].x,
                                y: dataGame.gameStateCopy.ports[i].y
                            }
                            subArr.push(createCustPriceXY);
                        }
                    }
                }
                dataItem.createCustPriceXY.push(subArr);
                subArr = [];
            }
            dataItem.createCustPriceXY.shift();
        },

        //Операции с портами
        findHome: function (portsArr) {
            for (let i in portsArr) {
                if (portsArr[i].isHome == true) {
                    dataPorts.homePort = {
                        x: portsArr[i].x,
                        y: portsArr[i].y
                    };
                }
            }
        },
    };

    console.log("Исходные данные уровня");
    console.log(gameState);

    functionData.findHome(dataGame.gameStateCopy.ports);

    functionData.mapCustomCalc();
    //console.log("Кастоманая карта");
    //console.log(dataGame.levelMapCustom);

    ////functionData.calcMapSize();
    //console.log("Размерность карты в x и y");
    //console.log(dataGame.sizeMap);

    ////functionData.createMapCustArr(dataGame.levelMapCustom);
    //console.log("Двумерный массив");
    //console.log(dataGame.levelMapCustomArr);

    ////functionData.findBarrier(dataGame.levelMapCustomArr);
    //console.log("Коррдинаты всех барьеров");
    //console.log(dataGame.levelMapBarriers);

    functionData.extractPrices();
    //console.log('Кастомный gameState.prices');
    //console.log(dataItem.customPrices);

    ////functionData.createCustPriceXY();
    //console.log('Кастомный прайс с x и y координатами'); 
    //console.log(dataItem.createCustPriceXY);

    addPriorForItem();
    console.log('Кастомный прайс + координаты + приоритеты');
    console.log(dataItem.priorityAllItem)

    dataPorts.quantityOfPors = dataGame.gameStateCopy.ports.length; //Количество портов на уровне

    multiplyPort(dataItem.priorityAllItem);
    console.log(dataItem.bestItems);

    findBestMulti(dataItem.bestItems);
    console.log(dataItem.bestPortOnly);
    console.log(dataItem.bestPortOnlyObj);
}


let countMove = 0;

export function getNextCommand(gameState) {
    dataGame.counter += 1;

    dataPirate.positionPirates = []; //Очистка массива с текущей позицией пирата(ов)
    dataPirate.customSizePirate = []; //Очистка массива с текущей кастомной позицией пирата(ов)

    dataShip.setPosition = {
        x: gameState.ship.x + 1,
        y: gameState.ship.y + 1
    }; // + 1 сделано //Запись объекта с текущей позицией корабля

    for (let i in gameState.pirates) {
        dataPirate.positionPirates.push({
            x: gameState.pirates[i].x + 1,
            y: gameState.pirates[i].y + 1
        }); // + 1 сделано ! //Запись массива с текущей позицией пирата(ов)
    }

    //проверка на то что если он не дома
    if (countMove == 0) {
        if (dataShip.setPosition.x != dataPorts.homePort.x + 1 || dataShip.setPosition.y != dataPorts.homePort.y + 1) {
            dataPorts.finishPoint = {
                x: dataPorts.homePort.x,
                y: dataPorts.homePort.y
            };
            pathfinder();
            return dataShip.positionComm;
        }
    }
    countMove++;

    if (dataShip.setPosition.x == dataPorts.homePort.x + 1 && dataShip.setPosition.y == dataPorts.homePort.y + 1) {
        if (dataShip.shipVolume == 368) {

            multiplyPort(dataItem.priorityAllItem);
            findBestMulti(dataItem.bestItems);

            if (dataItem.bestPortOnlyObj.pathLength > 180 - dataGame.counter) {
                findBestMultiLast(dataItem.bestItems);
            }
        }

        for (let i in dataItem.bestItems) {
            for (let k in dataItem.bestItems[i]) {
                if (dataItem.bestPortOnlyObj.portId == dataItem.bestItems[i][k].portId) {
                    if (dataShip.shipVolume >= dataItem.bestItems[i][k].volume && dataItem.bestItems[i][k].amount != 0) {
                        let amountLoad = 0;

                        if (dataItem.bestItems[i][k].amount < parseInt(dataShip.shipVolume / dataItem.bestItems[i][k].volume)) {
                            amountLoad = dataItem.bestItems[i][k].amount;
                            amountMinus(dataItem.bestItems[i][k], amountLoad);
                            dataShip.shipVolume -= amountLoad * dataItem.bestItems[i][k].volume;
                            dataShip.itemOnShipArr.push({
                                name: dataItem.bestItems[i][k].name,
                                amount: amountLoad,
                                volume: dataItem.bestItems[i][k].volume
                            });
                            return `LOAD ${dataItem.bestItems[i][k].name} ${amountLoad}`

                        } else {
                            amountLoad = parseInt(dataShip.shipVolume / dataItem.bestItems[i][k].volume);
                            amountMinus(dataItem.bestItems[i][k], amountLoad);
                            dataShip.shipVolume -= amountLoad * dataItem.bestItems[i][k].volume;
                            dataShip.itemOnShipArr.push({
                                name: dataItem.bestItems[i][k].name,
                                amount: amountLoad,
                                volume: dataItem.bestItems[i][k].volume
                            });
                            return `LOAD ${dataItem.bestItems[i][k].name} ${amountLoad}`
                        }
                    }
                }
            }
        }
        dataPorts.finishPoint = {
            x: dataItem.bestPortOnlyObj.x,
            y: dataItem.bestPortOnlyObj.y
        };
        //console.log(dataPorts.finishPoint);
        pathfinder();
        return dataShip.positionComm;
    }

    if (dataShip.setPosition.x == dataItem.bestPortOnlyObj.x + 1 && dataShip.setPosition.y == dataItem.bestPortOnlyObj.y + 1) {
        if (gameState.ship.goods.length != 0) {
            for (let i in dataShip.itemOnShipArr) {
                if (dataShip.itemOnShipArr[i].check != true) {
                    let objSellq = dataShip.itemOnShipArr[i];
                    dataShip.itemOnShipArr[i].check = true;
                    dataShip.shipVolume += objSellq.amount * objSellq.volume;
                    return `SELL ${objSellq.name} ${objSellq.amount}`;
                }
            }
        } else {
            dataItem.bestItems = [];
            dataItem.bestPortOnlyObj = {};
            dataItem.bestPortOnly = [];
            dataShip.itemOnShipArr = [];

            dataPorts.finishPoint = {
                x: dataPorts.homePort.x,
                y: dataPorts.homePort.y
            };
            pathfinder();
            return dataShip.positionComm;
        }
    } else {
        pathfinder();
        return dataShip.positionComm;
    }
    //return "WAIT"

}