// *** ФИНАЛЬНЕ ВИПРАВЛЕННЯ ДЛЯ iOS: Весь код обгорнуто в DOMContentLoaded ***
document.addEventListener('DOMContentLoaded', () => {
    
    // --- ГЛОБАЛЬНАЯ ПЕРЕМЕННАЯ ДЛЯ РЕЖИМА РАСЧЕТА ---
    let calculationMode = 'exact'; // 'exact' (точный) или 'round' (с округлением)

    // --- КОНСТАНТЫ ЦЕН ---

    const DELIVERY_PRICES = {
        "Мешковка": 0, "Балабановка": 1700, "Жукова": 1700, "Матвеевка": 2300, 
        "Терновка": 2300, "Варваровка": 2300, "Капустина балка": 2500, 
        "Лиманы": 3500, "Полигон": 1700, "Радсад": 2500, "Баловное": 2800
    };
    const PRICE_PER_KM = 70; 

    const PODRAMNIK_PRICES = {
        "без плитки": 4000, "облиц керамика верх": 4500, "облиц керамика верх+торцы": 6000,
        "без окна облиц керамика верх+торцы": 7500, "облиц гранит черный верх": 7000, 
        "облиц гранит черный верх+торцы": 13000, "облицовка гранит зеленый верх+торцы": 15000
    };
    
    const BALKI_PRICE = 1200; 
    const OTVERSTIA_PRICE = 1000;
    
    const PODRAMNIK_INSTALL_PRICES = {
        "без плитки": 1800,
        "с керамической плиткой": 1800,
        "с гранитной плиткой": 2800
    };
    
    // КОНСТАНТА ЦЕНЫ УСТАНОВКИ ПАМЯТНИКА
    const MONUMENT_INSTALL_PRICES = {
        "до 110-50-8": { cost: 4500, display: '4500.00 грн' },
        "до 130-60-8": { cost: 5500, display: '5500.00 грн' },
        "до 140-70-8 на фундамент": { cost: 7000, display: '7000.00 грн (Договорная)' },
        "гранитного комплекса": { cost: 8000, display: '8000.00 грн (Договорная)' },
        "произведённые работы": { cost: 5500, display: '5500.00 грн' }
    };

    const FORMWORK_PRICES = {
        "0.2": 6000, 
        "0.1": 5000  
    };
    
    const SHUBA_PRICE = 600;
    const SHTUKATURKA_PRICE = 500;
    
    const GRANIT_PRICES = {
        "Букинский чёрный": 5000, "Покостовка серый": 4200,
        "Токовский": 6000, "Лезник рыжий": 6000
    };
    
    const CERAMIC_PRICES = {
        "Грес чёрный": 2300, "Грес серый": 1500,
        "Грес Покостовка": 1800, "Грес Капустянский": 1800
    };

    const GRANIT_WORK_PRICES = {
        "Букинский чёрный": { top: 2500, side: 4000 },
        "Покостовка серый": { top: 2500, side: 4000 },
        "Токовский": { top: 2500, side: 4000 },
        "Лезник рыжий": { top: 2500, side: 4000 },
    };
    
    const CERAMIC_WORK_PRICES = {
        "Грес чёрный": { top: 2000, side: 3500 },
        "Грес серый": { top: 2000, side: 3500 },
        "Грес Покостовка": { top: 2000, side: 3500 },
        "Грес Капустянский": { top: 2000, side: 3500 }
    };
    
    const PLITA_PRICES = {
        "60-60-5": 5800, "80-40-5": 5800, "100-50-5": 7500, 
        "100-60-5": 7800, "120-60-5": 11000, "130-60-5": 13000,
        "100-30-8": 6800, "60-60-8": 6500, "80-40-8": 6500, 
        "100-50-8": 8800, "100-60-8": 9900, "120-60-8": 13500, 
        "130-60-8": 15600, "140-60-8": 18600, "150-60-8": 20400, 
        "160-60-8": 25200, "100-70-8": 15600, "120-70-8": 21600, 
        "130-70-8": 25200, "140-70-8": 30000, "150-70-8": 32400,
        "160-70-8": 'Договорная', "170-70-8": 'Договорная', 
        "120-80-8": 25200, "130-80-8": 30000, "140-80-8": 37200, 
        "150-80-8": 49200,
        "150-120-8": 'Договорная', "180-90-8": 'Договорная', "200-100-8": 'Договорная'
    };

    const TUMBA_PRICES = {
        "50-20-15": 4200, 
        "60-20-15": 4600, 
        "70-20-15": 5400, 
        "70-20-20": 5900, 
        "80-20-20": 6500, 
        "100-20-20": 9500, 
        "120-20-20": 11700, 
        "70-30-20": 9500
    };
    
    const PORTRAIT_PRICES = {
        "на плите до 130-60-8": { cost: 3500, type: 'fixed' },
        "поясной": { cost: 5000, type: 'fixed' },
        "рост на 100-50": { cost: 7500, type: 'min' }, // 'от' цена
        "рост на 120-60": { cost: 8500, type: 'min' }, // 'от' цена
        "сложный фон": { cost: 0, type: 'contract' } // 'Договорная'
    };
    
    const FIO_DATES_PRICE = 1500;
    
    const EPITAPH_PRICE = 1000;


    // --- ФУНКЦИИ РАСЧЕТА ---

    /**
     * ХЕЛПЕР: Округляет число в большую сторону до сотых (0.01).
     */
    function roundUpToNearestHundreth(num) {
        return Math.ceil(num * 100) / 100;
    }

    /**
     * ХЕЛПЕР: Извлекает и перемножает первые два числа из строки (Д*Ш).
     * Применяет округление, если calculationMode == 'round'.
     */
    function getAreaFromInput(inputString) {
        // Исправление для iOS: Сначала заменяем запятую на точку, чтобы parseFloat работал корректно.
        const cleanedString = inputString.replace(/,/g, '.').replace(/[^\d\.\s]/g, '');
        const matches = cleanedString.match(/(\d+\.?\d*)/g);
        
        if (matches && matches.length >= 2) {
            let num1 = parseFloat(matches[0]);
            let num2 = parseFloat(matches[1]);
            let area = num1 * num2;
            
            if (calculationMode === 'round') {
                // Округляем в большую сторону до сотых
                num1 = roundUpToNearestHundreth(num1);
                num2 = roundUpToNearestHundreth(num2);
                area = roundUpToNearestHundreth(area); 
            }
            
            if (!isNaN(num1) && !isNaN(num2)) {
                // Возвращаем [Длина, Ширина, Площадь]
                return [num1, num2, area]; 
            }
        }
        return [0, 0, 0]; 
    }

    // 1. Расчет БАЗОВОЙ стоимости доставки
    function calculateBaseDeliveryCost(locationOrKm) {
        const cleanInput = locationOrKm.trim();
        if (DELIVERY_PRICES.hasOwnProperty(cleanInput)) {
            return DELIVERY_PRICES[cleanInput];
        }
        
        // ИСПРАВЛЕНИЕ ДЛЯ iOS/Android: Регулярное выражение теперь ищет число,
        // допуская как запятую (,), так и точку (.) в качестве разделителя.
        const kmMatch = cleanInput.match(/(\d+[,.]?\d*)/); 
        if (kmMatch) {
            // Принудительная замена запятых на точки для корректного parseFloat.
            const numStr = kmMatch[0].replace(',', '.'); 
            const km = parseFloat(numStr);
            
            if (!isNaN(km) && km > 0) {
                return km * PRICE_PER_KM;
            }
        }
        return 0;
    }

    // 2. Расчет стоимости подрамника
    function calculatePodramnikCost(option) {
        const cleanOption = option.trim();
        if (PODRAMNIK_PRICES.hasOwnProperty(cleanOption)) {
            return PODRAMNIK_PRICES[cleanOption];
        }
        return 0;
    }

    // 3. Расчет стоимости балок
    function calculateBalkiCost(isChecked) {
        return isChecked ? BALKI_PRICE : 0;
    }
    
    // 4. Расчет стоимости отверстий
    function calculateOtverstiaCost(isChecked) {
        return isChecked ? OTVERSTIA_PRICE : 0;
    }

    // 5. Расчет стоимости установки подрамника
    function calculatePodramnikInstallCost(option) {
        const cleanOption = option.trim();
        if (PODRAMNIK_INSTALL_PRICES.hasOwnProperty(cleanOption)) {
            return PODRAMNIK_INSTALL_PRICES[cleanOption];
        }
        return 0;
    }
    
    // 6. Расчет стоимости установки памятника
    function calculateMonumentInstallCost(option) {
        const cleanOption = option.trim();
        const result = MONUMENT_INSTALL_PRICES[cleanOption];
        
        if (result) {
            const isContract = result.display.includes('(Договорная)');
            const priceText = result.cost.toFixed(2) + ' грн'; 
            
            return { 
                cost: result.cost, 
                priceDisplay: priceText, 
                isContract: isContract 
            };
        }
        return { cost: 0, priceDisplay: '0 грн', isContract: false };
    }


    // 7. Расчет данных опалубки 
    function calculateFormworkData(heightStr, sizeStr, windowStr) {
        const [sizeLength, sizeWidth, grossArea] = getAreaFromInput(sizeStr);
        const [, , windowArea] = getAreaFromInput(windowStr); 
        
        let netArea = grossArea - windowArea;
        if (netArea < 0) netArea = 0; 
        
        const cleanHeight = heightStr.replace(',', '.');
        let height = 0;
        let pricePerSqMeter = 0;
        
        if (cleanHeight.includes("0.2")) {
            height = 0.2;
            pricePerSqMeter = FORMWORK_PRICES["0.2"];
        } else if (cleanHeight.includes("0.1")) {
            height = 0.1;
            pricePerSqMeter = FORMWORK_PRICES["0.1"];
        }

        let finalNetArea = netArea;
        let finalHeight = height;
        
        if (calculationMode === 'round') {
            finalNetArea = roundUpToNearestHundreth(netArea);
            finalHeight = roundUpToNearestHundreth(height);
        }
        
        return {
            cost: finalNetArea * pricePerSqMeter, 
            height: finalHeight,         
            sizeLength: sizeLength, 
            sizeWidth: sizeWidth,   
            grossArea: grossArea,   
            windowArea: windowArea   
        };
    }
    
    // 8. Расчет стоимости Шубы/Штукатурки
    function calculateShubaShtukaturkaCost(formworkData, option) {
        const cleanOption = option.trim();
        const { sizeLength, sizeWidth, height } = formworkData; 

        if (sizeLength === 0 || sizeWidth === 0 || height === 0 || cleanOption === "") {
            return 0;
        }

        // Площадь торцов: (Длина + Ширина) * 2 * Высота
        const sideSurfaceArea = (sizeLength + sizeWidth) * 2 * height;

        let price = 0;
        if (cleanOption === "Шуба") {
            price = SHUBA_PRICE; 
        } else if (cleanOption === "Штукатурка") {
            price = SHTUKATURKA_PRICE; 
        }

        let finalSideSurfaceArea = sideSurfaceArea;
        if (calculationMode === 'round') {
            finalSideSurfaceArea = roundUpToNearestHundreth(sideSurfaceArea);
        }
        
        return finalSideSurfaceArea * price;
    }

    // 9. Расчет стоимости гранитной плитки (Материал)
    function calculateGranitCost(formworkData, granitTopType, granitSideType) {
        const result = { cost: 0, topArea: 0, sideArea: 0 };
        
        const priceTop = GRANIT_PRICES[granitTopType.trim()] || 0;
        const priceSide = GRANIT_PRICES[granitSideType.trim()] || 0;
        
        // Площадь Верха (Материал Гранит): (Д*Ш - Окно Д*Ш) + 0.1
        let topArea = formworkData.grossArea - formworkData.windowArea + 0.1;
        result.topArea = Math.max(0, topArea);
        
        // Площадь Торца (Материал Гранит): (Д + Ш) * 2 * Высота
        let sideArea = (formworkData.sizeLength + formworkData.sizeWidth) * 2 * formworkData.height;
        result.sideArea = Math.max(0, sideArea);

        if (calculationMode === 'round') {
            result.topArea = roundUpToNearestHundreth(result.topArea);
            result.sideArea = roundUpToNearestHundreth(result.sideArea);
        }

        result.cost = (result.topArea * priceTop) + (result.sideArea * priceSide);
        return result;
    }

    // 10. Расчет стоимости работы по гранитной плитке
    function calculateGranitWorkCost(formworkData, granitWorkTopType, granitWorkSideType) {
        const result = { cost: 0, topArea: 0, sideArea: 0 };
        
        const cleanTopType = granitWorkTopType.trim();
        const cleanSideType = granitWorkSideType.trim();

        const priceTopWork = GRANIT_WORK_PRICES[cleanTopType] ? GRANIT_WORK_PRICES[cleanTopType].top : 0;
        const priceSideWork = GRANIT_WORK_PRICES[cleanSideType] ? GRANIT_WORK_PRICES[cleanSideType].side : 0;
        
        // Площадь Верха (Работа): Общая площадь Д*Ш - Площадь окна Д*Ш 
        let topArea = formworkData.grossArea - formworkData.windowArea;
        result.topArea = Math.max(0, topArea);
        
        // Площадь Торца (Работа): (Длина + Ширина) * 2 * Высота
        let sideArea = (formworkData.sizeLength + formworkData.sizeWidth) * 2 * formworkData.height;
        result.sideArea = Math.max(0, sideArea);

        if (calculationMode === 'round') {
            result.topArea = roundUpToNearestHundreth(result.topArea);
            result.sideArea = roundUpToNearestHundreth(result.sideArea);
        }

        result.cost = (result.topArea * priceTopWork) + (result.sideArea * priceSideWork);
        return result;
    }
    
    // 11. Расчет стоимости керамической плитки (Материал)
    function calculateCeramicCost(formworkData, ceramicTopType, ceramicSideType) {
        const result = { cost: 0, topArea: 0, sideArea: 0 };
        
        const priceTop = CERAMIC_PRICES[ceramicTopType.trim()] || 0;
        const priceSide = CERAMIC_PRICES[ceramicSideType.trim()] || 0;
        
        // Площадь Верха (Материал Керамика): (Д*Ш - Окно Д*Ш) + 0.27
        let topArea = formworkData.grossArea - formworkData.windowArea + 0.27;
        result.topArea = Math.max(0, topArea);
        
        // Площадь Торца (Материал Керамика): (Д + Ш) * 2 * Высота
        let sideArea = (formworkData.sizeLength + formworkData.sizeWidth) * 2 * formworkData.height;
        result.sideArea = Math.max(0, sideArea);

        if (calculationMode === 'round') {
            result.topArea = roundUpToNearestHundreth(result.topArea);
            result.sideArea = roundUpToNearestHundreth(result.sideArea);
        }

        result.cost = (result.topArea * priceTop) + (result.sideArea * priceSide);
        return result;
    }

    // 12. Расчет стоимости работы по керамической плитке
    function calculateCeramicWorkCost(formworkData, ceramicWorkTopType, ceramicWorkSideType) {
        const result = { cost: 0, topArea: 0, sideArea: 0 };
        
        const cleanTopType = ceramicWorkTopType.trim();
        const cleanSideType = ceramicWorkSideType.trim();

        const priceTopWork = CERAMIC_WORK_PRICES[cleanTopType] ? CERAMIC_WORK_PRICES[cleanTopType].top : 0;
        const priceSideWork = CERAMIC_WORK_PRICES[cleanSideType] ? CERAMIC_WORK_PRICES[cleanSideType].side : 0;
        
        // Площадь Верха (Работа): Общая площадь Д*Ш - Площадь окна Д*Ш 
        let topArea = formworkData.grossArea - formworkData.windowArea;
        result.topArea = Math.max(0, topArea);
        
        // Площадь Торца (Работа): (Длина + Ширина) * 2 * Высота
        let sideArea = (formworkData.sizeLength + formworkData.sizeWidth) * 2 * formworkData.height;
        result.sideArea = Math.max(0, sideArea);

        if (calculationMode === 'round') {
            result.topArea = roundUpToNearestHundreth(result.topArea);
            result.sideArea = roundUpToNearestHundreth(result.sideArea);
        }

        result.cost = (result.topArea * priceTopWork) + (result.sideArea * priceSideWork);
        return result;
    }
    
    // 13. Расчет стоимости плиты
    function calculatePlitaCost(option) {
        const cleanOption = option.trim();
        const price = PLITA_PRICES[cleanOption];
        
        if (typeof price === 'number') {
            return { cost: price, display: price.toFixed(2) + ' грн' };
        } else if (price === 'Договорная') {
            return { cost: 0, display: 'Договорная' }; 
        }
        return { cost: 0, display: '0 грн' };
    }
    
    // 14. Расчет стоимости тумбы
    function calculateTumbaCost(option) {
        const cleanOption = option.trim();
        const price = TUMBA_PRICES[cleanOption];
        
        if (typeof price === 'number') {
            return { cost: price, display: price.toFixed(2) + ' грн' };
        }
        return { cost: 0, display: '0 грн' };
    }
    
    // 15. Расчет стоимости портрета
    function calculatePortraitCost(option) {
        const cleanOption = option.trim();
        const result = PORTRAIT_PRICES[cleanOption];

        if (result) {
            if (result.type === 'fixed') {
                return { cost: result.cost, display: result.cost.toFixed(2) + ' грн' };
            } else if (result.type === 'min') {
                return { cost: result.cost, display: `от ${result.cost.toFixed(2)} грн` };
            } else if (result.type === 'contract') {
                return { cost: 0, display: 'Договорная' };
            }
        }
        return { cost: 0, display: '0 грн' };
    }
    
    // 16. Расчет стоимости ФИО+даты
    function calculateFioDatesCost(isChecked) {
        return isChecked ? FIO_DATES_PRICE : 0;
    }
    
    // 17. Расчет стоимости Эпитафии
    function calculateEpitaphCost(isChecked) {
        return isChecked ? EPITAPH_PRICE : 0;
    }


    // 18. Основная функция расчета и обновления всех значений
    function updateCalculations() {
        // --- Получение данных ---
        const deliveryInput = document.getElementById('input-delivery').value;
        const podramnikInput = document.getElementById('input-podramnik').value;
        const balkiChecked = document.getElementById('input-balki').checked;
        const otverstiaChecked = document.getElementById('input-otverstia').checked;
        const podramnikInstallInput = document.getElementById('input-podramnik-install').value; 
        const monumentInstallInput = document.getElementById('input-monument-install').value; 
        const formworkHeightInput = document.getElementById('input-formwork-height').value;
        const formworkSizeInput = document.getElementById('input-formwork-size').value;
        const formworkWindowInput = document.getElementById('input-formwork-window').value;
        const shubaShtukaturkaInput = document.getElementById('input-shuba-shtukaturka').value; 
        const granitTopInput = document.getElementById('input-granit-top').value;
        const granitSideInput = document.getElementById('input-granit-side').value;
        const granitWorkTopInput = document.getElementById('input-granit-work-top').value; 
        const granitWorkSideInput = document.getElementById('input-granit-work-side').value; 
        const ceramicTopInput = document.getElementById('input-ceramic-top').value;
        const ceramicSideInput = document.getElementById('input-ceramic-side').value;
        const ceramicWorkTopInput = document.getElementById('input-ceramic-work-top').value; 
        const ceramicWorkSideInput = document.getElementById('input-ceramic-work-side').value; 
        const plitaInput = document.getElementById('input-plita').value; 
        const tumbaInput = document.getElementById('input-tumba').value; 
        const portraitInput = document.getElementById('input-portrait').value; 
        const fioDatesChecked = document.getElementById('input-fio-dates').checked; 
        const epitaphChecked = document.getElementById('input-epitaph').checked; 

        const multiplier = parseFloat(document.getElementById('delivery-multiplier').value) || 1; 

        
        // --- Расчеты ---
        const baseCostDelivery = calculateBaseDeliveryCost(deliveryInput);
        const finalCostDelivery = baseCostDelivery * multiplier; 
        const costPodramnik = calculatePodramnikCost(podramnikInput);
        const costBalki = calculateBalkiCost(balkiChecked); 
        const costOtverstia = calculateOtverstiaCost(otverstiaChecked); 
        const costPodramnikInstall = calculatePodramnikInstallCost(podramnikInstallInput); 
        
        const monumentInstallResult = calculateMonumentInstallCost(monumentInstallInput); 
        const costMonumentInstall = monumentInstallResult.cost; 
        
        // Данные опалубки
        const formworkData = calculateFormworkData(formworkHeightInput, formworkSizeInput, formworkWindowInput);
        const costFormwork = formworkData.cost;
        
        // Стоимость Шубы/Штукатурки
        const costShubaShtukaturka = calculateShubaShtukaturkaCost(formworkData, shubaShtukaturkaInput); 
        
        // Стоимость материала Гранит
        const granitResult = calculateGranitCost(formworkData, granitTopInput, granitSideInput);
        const costGranit = granitResult.cost; 
        
        // Стоимость работы Гранит
        const granitWorkResult = calculateGranitWorkCost(formworkData, granitWorkTopInput, granitWorkSideInput);
        const costGranitWork = granitWorkResult.cost; 

        // Стоимость материала Керамика
        const ceramicResult = calculateCeramicCost(formworkData, ceramicTopInput, ceramicSideInput);
        const costCeramic = ceramicResult.cost;

        // Стоимость работы Керамика
        const ceramicWorkResult = calculateCeramicWorkCost(formworkData, ceramicWorkTopInput, ceramicWorkSideInput);
        const costCeramicWork = ceramicWorkResult.cost;
        
        // Стоимость Плиты
        const plitaResult = calculatePlitaCost(plitaInput); 
        const costPlita = plitaResult.cost;
        
        // Стоимость Тумбы
        const tumbaResult = calculateTumbaCost(tumbaInput); 
        const costTumba = tumbaResult.cost;
        
        // Стоимость Портрета
        const portraitResult = calculatePortraitCost(portraitInput); 
        const costPortrait = portraitResult.cost;
        
        // Стоимость ФИО+даты
        const costFioDates = calculateFioDatesCost(fioDatesChecked);
        
        // Стоимость Эпитафии
        const costEpitaph = calculateEpitaphCost(epitaphChecked);
        
        // Общая стоимость 
        const grandTotalCost = finalCostDelivery + costPodramnik + costBalki + costOtverstia + costPodramnikInstall + costMonumentInstall + costFormwork + costShubaShtukaturka + costGranit + costGranitWork + costCeramic + costCeramicWork + costPlita + costTumba + costPortrait + costFioDates + costEpitaph; 
        
        // --- Обновление HTML ---
        
        document.getElementById('result-delivery').textContent = finalCostDelivery.toFixed(2) + ' грн';
        document.getElementById('result-podramnik').textContent = costPodramnik.toFixed(2) + ' грн';
        document.getElementById('result-balki').textContent = costBalki.toFixed(2) + ' грн'; 
        document.getElementById('result-otverstia').textContent = costOtverstia.toFixed(2) + ' грн'; 
        document.getElementById('result-podramnik-install').textContent = costPodramnikInstall.toFixed(2) + ' грн'; 
        
        // Обновление Установки памятника
        const monumentDisplayElement = document.getElementById('result-monument-install');
        const monumentSubtextElement = document.getElementById('result-monument-install-subtext');

        monumentDisplayElement.textContent = monumentInstallResult.priceDisplay;
        
        if (monumentInstallResult.isContract) {
            monumentSubtextElement.textContent = '(Договорная)';
            monumentSubtextElement.classList.add('contract-subtext');
            monumentDisplayElement.classList.add('contract-price'); 
        } else {
            monumentSubtextElement.textContent = '';
            monumentSubtextElement.classList.remove('contract-subtext');
            monumentDisplayElement.classList.remove('contract-price');
        }
        
        document.getElementById('result-formwork').textContent = costFormwork.toFixed(2) + ' грн';
        document.getElementById('result-shuba-shtukaturka').textContent = costShubaShtukaturka.toFixed(2) + ' грн'; 
        
        // Обновление гранита (материал)
        document.getElementById('result-granit').textContent = costGranit.toFixed(2) + ' грн';
        document.getElementById('result-granit-detail').textContent = 
            `Верх: ${granitResult.topArea.toFixed(2)} м², Торец: ${granitResult.sideArea.toFixed(2)} м²`;

        // Обновление работы по граниту
        document.getElementById('result-granit-work').textContent = costGranitWork.toFixed(2) + ' грн';
        document.getElementById('result-granit-work-detail').textContent = 
            `Верх: ${granitWorkResult.topArea.toFixed(2)} м², Торец: ${granitWorkResult.sideArea.toFixed(2)} м²`;
        
        // Обновление керамики (материал)
        document.getElementById('result-ceramic').textContent = costCeramic.toFixed(2) + ' грн';
        document.getElementById('result-ceramic-detail').textContent = 
            `Верх: ${ceramicResult.topArea.toFixed(2)} м², Торец: ${ceramicResult.sideArea.toFixed(2)} м²`;

        // Обновление работы по керамике
        document.getElementById('result-ceramic-work').textContent = costCeramicWork.toFixed(2) + ' грн';
        document.getElementById('result-ceramic-work-detail').textContent = 
            `Верх: ${ceramicWorkResult.topArea.toFixed(2)} м², Торец: ${ceramicWorkResult.sideArea.toFixed(2)} м²`;

        // Обновление Плиты
        const plitaDisplayElement = document.getElementById('result-plita');
        plitaDisplayElement.textContent = plitaResult.display;
        if (plitaResult.display === 'Договорная') {
            plitaDisplayElement.classList.add('contract-price');
        } else {
            plitaDisplayElement.classList.remove('contract-price');
        }
        
        // Обновление Тумбы
        document.getElementById('result-tumba').textContent = tumbaResult.display;

        // Обновление Портрета
        const portraitDisplayElement = document.getElementById('result-portrait');
        portraitDisplayElement.textContent = portraitResult.display;
        if (portraitResult.display.includes('от') || portraitResult.display === 'Договорная') {
            portraitDisplayElement.classList.add('contract-price');
        } else {
            portraitDisplayElement.classList.remove('contract-price');
        }
        
        // Обновление ФИО+даты
        document.getElementById('result-fio-dates').textContent = costFioDates.toFixed(2) + ' грн';
        
        // Обновление Эпитафии
        document.getElementById('result-epitaph').textContent = costEpitaph.toFixed(2) + ' грн';

        document.getElementById('total-cost-amount').textContent = grandTotalCost.toFixed(2) + ' грн';
    }

    // 19. Установка множителя для доставки
    function setDeliveryMultiplier(event) {
        const targetButton = event.currentTarget;
        const multiplier = targetButton.getAttribute('data-multiplier');
        
        document.getElementById('delivery-multiplier').value = multiplier;
        
        const buttons = document.querySelectorAll('.delivery-multiplier-buttons button');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        targetButton.classList.add('active');
        
        updateCalculations();
    }
    
    // 20. Переключение режима расчета
    function setCalculationMode(event) {
        const newMode = event.currentTarget.getAttribute('data-mode');
        
        if (calculationMode === newMode) return; 

        calculationMode = newMode;
        
        // Обновление активного класса для кнопок
        document.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
        
        // Перезапуск всех расчетов с новым режимом
        updateCalculations();
    }

    // --- ПРИВЯЗКА ФУНКЦИЙ К ПОЛЯМ ВВОДА И КНОПКАМ ---
    
    // 1. Привязка 'input' И 'change' для всех полей
    const inputsToMonitor = [
        'input-delivery', 
        'input-podramnik',
        'input-balki',
        'input-otverstia',
        'input-podramnik-install',
        'input-monument-install',
        'input-formwork-height', 
        'input-formwork-size', 
        'input-formwork-window',
        'input-shuba-shtukaturka', 
        'input-granit-top', 
        'input-granit-side',
        'input-granit-work-top', 
        'input-granit-work-side',
        'input-ceramic-top',
        'input-ceramic-side',
        'input-ceramic-work-top', 
        'input-ceramic-work-side',
        'input-plita', 
        'input-tumba',
        'input-portrait',
        'input-fio-dates',
        'input-epitaph'
    ];
    
    inputsToMonitor.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // 'change' для <select> и <input type="checkbox">, 'input' для <input type="text">
            element.addEventListener('input', updateCalculations); 
            element.addEventListener('change', updateCalculations); 
        }
    });

    // 2. Привязка кнопок-множителей
    document.querySelectorAll('.delivery-multiplier-buttons button').forEach(button => {
        button.addEventListener('click', setDeliveryMultiplier);
    });
    
    // 3. Привязка кнопок режима расчета
    document.getElementById('btn-exact').addEventListener('click', setCalculationMode);
    document.getElementById('btn-round').addEventListener('click', setCalculationMode);

    // Первичный расчет при загрузке страницы (теперь безопасно внутри DOMContentLoaded)
    updateCalculations();

    // --------------------------------------------------------
    // --- НОВАЯ ЛОГИКА: Принудительный запуск музыки по клику ---
    // --------------------------------------------------------
    
    const musicElement = document.getElementById('background-music');

    function startMusic() {
        if (musicElement) {
            // musicElement.play() возвращает промис. Мы ловим ошибку, если браузер блокирует.
            musicElement.play().catch(error => {
                // В этом месте браузер блокирует автозапуск. Мы просто игнорируем ошибку.
                console.log("Autoplay blocked:", error); 
            });
            
            // Важно: как только музыка запустилась (или мы попытались это сделать), 
            // мы удаляем обработчик, чтобы не вызывать его при каждом клике.
            document.removeEventListener('click', startMusic); 
        }
    }
    
    // 1. Сначала пытаемся запустить музыку сразу при загрузке скрипта
    startMusic(); 
    
    // 2. Если запуск был заблокирован (что почти всегда происходит на мобильных), 
    // добавляем обработчик, который запустит музыку при первом клике на странице.
    document.addEventListener('click', startMusic);
    
    // --------------------------------------------------------

});
