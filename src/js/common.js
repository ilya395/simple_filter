"use strict"
//
let flatsList = {};
//
// получаем json из управляющего файла
//
let xhr = new XMLHttpRequest();
xhr.open('GET', 
		//  dataUrl
		'/data.json'
		// './call_to_sys.php'
		);
//
xhr.onload = function(callback) {
	if (xhr.status != 200) { // HTTP ошибка?
		// обработаем ошибку
		alert( 'Ошибка: ' + xhr.status);
		return;
	}
	// получим ответ из xhr.response
	flatsList = JSON.parse(xhr.response, function(key, value){
		if(key == 'image'){
			value = 'https://sys24.net/media/' + value;
		}
		if(key == 'price'){
			value = +(value/1000000).toFixed(1);
		}
		return value;
	});
	console.log(flatsList);
};
//
xhr.onprogress = function(event) {
	// выведем прогресс
	alert(`Загружено ${event.loaded} из ${event.total}`);
};
xhr.onerror = function() {
	// обработаем ошибку, не связанную с HTTP (например, нет соединения)
};
xhr.send();
//
//
//
window.onload = function(){
	//
	// отрисуем по дефолту
	//
	// ползунки по дефолту
	let minPrice = 0;
	let maxPrice = 0;
	let minArea = 0;
	let maxArea =0;
	let minFloor = 0;
	let maxFloor = 0;
	let countDefaultForRangeValues = 0;
	for(let i of flatsList){
		if(countDefaultForRangeValues == 0){
			minPrice = i['price'];
			maxPrice = i['price'];
			minArea = i['area'];
			maxArea = i['area'];
			minFloor = i['floor'];
			maxFloor = i['floor'];
			countDefaultForRangeValues++;
		}else{
			if(i['price'] > maxPrice){
				maxPrice = i['price'];
			}
			if(i['price'] < minPrice){
				minPrice = i['price'];
			}
			//
			if(i['area'] > maxArea){
				maxArea = i['area'];
			}
			if(i['area'] < minArea){
				minArea = i['area'];
			}
			//
			if(i['floor'] > maxFloor){
				maxFloor = i['floor'];
			}
			if(i['floor'] < minFloor){
				minFloor = i['floor'];
			}
		}
	}
	// управление бегунками 
	let objectRangePrice = document.querySelector(".ranges-list .price-line .line__ranges");
	managementRangeSelect(objectRangePrice, 20, 25, minPrice, maxPrice);

	let objectRangeArea = document.querySelector(".ranges-list .area-line .line__ranges");
	managementRangeSelect(objectRangeArea, 200, 0, minArea, maxArea);

	let objectRangeFloor = document.querySelector(".ranges-list .floor-line .line__ranges");
	managementRangeSelect(objectRangeFloor, 22, 0, minFloor, maxFloor);
	//
	let minValueRangeLinePrice = document.querySelector(".range-select.price-line .line__value-input.line__min-val-input");
	// minValueRangeLinePrice.value = minPrice;
	let maxValueRangeLinePrice = document.querySelector(".range-select.price-line .line__value-input.line__max-val-input");
	// maxValueRangeLinePrice.value = maxPrice;

	let minValueRangeLineArea = document.querySelector(".range-select.area-line .line__value-input.line__min-val-input");
	// minValueRangeLineArea.value = minArea;
	let maxValueRangeLineArea = document.querySelector(".range-select.area-line .line__value-input.line__max-val-input");
	// maxValueRangeLineArea.value = maxArea;

	let minValueRangeLineFloor = document.querySelector(".range-select.floor-line .line__value-input.line__min-val-input");
	// minValueRangeLineFloor.value = minFloor;
	let maxValueRangeLineFloor = document.querySelector(".range-select.floor-line .line__value-input.line__max-val-input");
	// maxValueRangeLineFloor.value = maxFloor;
	//
	// фильтрация
	//
	let managementFilterObject = {
		roomInFilter: [false, false, false, false],
		priceInFilter: [minPrice, maxPrice],
		areaInFilter: [minArea, maxArea],
		floorInFilter: [minFloor, maxFloor],
		otherAttributes: [false, false, false, false, false]
	}
	giveValuesForInput(); // что понажимали в фильтре + переписываем управляющий объект
	let managementDefaultFilterObject = managementFilterObject;
	// console.log(managementDefaultFilterObject);
	//
	let flatsListAfterFilter = {}; // массив данных, который будем потображать после фильтрации
	mainFilter(managementFilterObject);
	//
	let defaultCount = 6; // прирост позиций
	drawContent(flatsListAfterFilter, defaultCount, true);
	//
	function giveValuesForInput(){
		//
		let roomItems = document.querySelectorAll(".button.rooms-item");
		for(let i = 0; i < roomItems.length; i++){
			if(roomItems[i].classList.contains("active")){
				managementFilterObject['roomInFilter'][i] = true;
				console.log('true');
			}else{
				managementFilterObject['roomInFilter'][i] = false;
			}
		}
		//
		managementFilterObject['priceInFilter'][0] = minValueRangeLinePrice.value;
		managementFilterObject['priceInFilter'][1] = maxValueRangeLinePrice.value;

		managementFilterObject['areaInFilter'][0] = minValueRangeLineArea.value;
		managementFilterObject['areaInFilter'][1] = maxValueRangeLineArea.value;

		managementFilterObject['floorInFilter'][0] = minValueRangeLineFloor.value;
		managementFilterObject['floorInFilter'][1] = maxValueRangeLineFloor.value;
		//
		let otherAttributes = document.querySelectorAll(".button.sight-item");
		for(let i = 0; i < otherAttributes.length; i++){
			if(otherAttributes[i].classList.contains("active")){
				managementFilterObject['otherAttributes'][i] = true;
			}else{
				managementFilterObject['otherAttributes'][i] = false;
			}
		}
		return managementFilterObject;
	}
	//
	function mainFilter(managementFilterObject){
		flatsListAfterFilter = {};
		// console.log(managementFilterObject);
		// console.log(flatsList);
		let countIter = 0;
		let matchCounter = 0; // ключевые совпадаения
		for(let i in flatsList){
			let matchCounterArr = [];
			// комнаты
			let falseRoomCount = 0;
			for(let j in managementFilterObject['roomInFilter']){
				if((managementFilterObject['roomInFilter'][j] == true) && (parseInt(j) == flatsList[i]['room_count'] - 1)){
					matchCounter++;
					matchCounterArr[0] = 1;
					// console.log(matchCounter);
				}
				if(managementFilterObject['roomInFilter'][j] == false){
					falseRoomCount++;
				}
				// console.log(managementFilterObject['roomInFilter'][j], parseInt(j), flatsList[i]['room_count']);
			}
			if(falseRoomCount == managementFilterObject['roomInFilter'].length){
				matchCounter++;
				matchCounterArr[0] = 1;
				// console.log(matchCounter);
			}
			// ползунки
			if(flatsList[i]['price'] >= managementFilterObject['priceInFilter'][0] && flatsList[i]['price'] <= managementFilterObject['priceInFilter'][1]){
				matchCounter++;
				matchCounterArr[1] = 1;
				// console.log(matchCounter);
			}
			if(flatsList[i]['area'] >= managementFilterObject['areaInFilter'][0] && flatsList[i]['area'] <= managementFilterObject['areaInFilter'][1]){
				matchCounter++;
				matchCounterArr[2] = 1;
				// console.log(matchCounter);
			}
			if(flatsList[i]['floor'] >= managementFilterObject['floorInFilter'][0] && flatsList[i]['floor'] <= managementFilterObject['floorInFilter'][1]){
				matchCounter++;
				matchCounterArr[3] = 1;
				// console.log(matchCounter);
			}
			// другие атрибуты
			let falseAttrCount = 0;
			for(let k in managementFilterObject['otherAttributes']){
				if(managementFilterObject['otherAttributes'][k] == true && flatsList[i]['other_attr'][k] != null){// flatsList[i]['other_attribute']){
					matchCounter++;
					matchCounterArr[4] = 1;
					// console.log(matchCounter);
				}
				if(managementFilterObject['otherAttributes'][k] == false){
					falseAttrCount++;
				}
			}
			if(falseAttrCount == managementFilterObject['otherAttributes'].length){
				matchCounter++;
				matchCounterArr[4] = 1;
				// console.log(matchCounter);
			}
			// проверка подходяит элемент объекта или нет

			if(matchCounter == 5){
				for(let m in flatsList[i]){
					if(m == 'other_attr'){
						flatsListAfterFilter[countIter] = {};
						flatsListAfterFilter[countIter][m] = {};
						for(let n in flatsList[i][m]){
							flatsListAfterFilter[countIter][m][n] = flatsList[i][m][n];
						}
					}else{
						flatsListAfterFilter[countIter][m] = flatsList[i][m];
					}
				}
				// flatsListAfterFilter[countIter] = flatsList[i];
				// Object.assign(flatsListAfterFilter[countIter], flatsList[i]);
				countIter++;
			}
			matchCounter = 0;
			// countIter++;
		}
		return flatsListAfterFilter;
	}
	//
	// сорировка
	//
	// function sortData(){

	// }
	//
	// отрисуем данные
	//
	function drawContent(obj, count, allInNull){
		let workBlock = document.querySelector(".content-main-block");
		let alreadyHere = document.querySelectorAll(".content-main-block .section-plan");
		if(allInNull == false){ //false - добавить, true - напечатать заного
			if(alreadyHere.length > 0){
				let j = 1;
				for(let i = (alreadyHere.length); i < (alreadyHere.length + count); i++){
					workBlock.insertAdjacentHTML("beforeend", 
						`<article class="section-plan col-12 col-md-6">
							<div class="section-plan__inner-wrap hovered">
								<div class="section-plan__image-block">
									<img src="${obj[i].image}" alt="" class="section-plan__img">
								</div>
								<div class="section-plan__info-block">
									Быстрый просмотр
								</div>
							</div>
						</article>`
					);
				}
			}else{
				for(let i in obj){
					if(i < count){
						workBlock.insertAdjacentHTML("beforeend", 
							`<article class="section-plan col-12 col-md-6">
								<div class="section-plan__inner-wrap hovered">
									<div class="section-plan__image-block">
										<img src="${obj[i].image}" alt="" class="section-plan__img">
									</div>
									<div class="section-plan__info-block">
										Быстрый просмотр
									</div>
								</div>
							</article>`
						);
					}
				}
			}
		}else{
			for(let i of alreadyHere){
				i.remove();
			}
			for(let i in obj){
				if(i < count){
					workBlock.insertAdjacentHTML("beforeend", 
						`<article class="section-plan col-12 col-md-6">
							<div class="section-plan__inner-wrap hovered">
								<div class="section-plan__image-block">
									<img src="${obj[i].image}" alt="" class="section-plan__img">
								</div>
								<div class="section-plan__info-block">
									Быстрый просмотр
								</div>
							</div>
						</article>`
					);
				}
			}
		}
	}
	// добавим еще позиций
	let pushToContentBtn = document.querySelector(".button-push.push-to-content.hovered");
	pushToContentBtn.addEventListener("click", function(){
		// defaultCount = defaultCount + 6;
		drawContent(flatsListAfterFilter, defaultCount, false);
	})
	//
	// управление
	//
	// управление вызовом модального окна
	let onModalBtns = document.querySelectorAll(".section-plan__info-block");
	//
	let modalBackground = document.querySelector(".modal-win");
	let modalWindow = document.querySelector(".modal-win__wrap.container");
	// вызываем окно
	for(let i of onModalBtns){
		i.addEventListener("click", function(){
			modalBackground.classList.add("active");
			modalWindow.classList.add("active")
		})
	}
	// выключим окно
	let modalClose = document.querySelector(".modal-win__close-me-plz");
	modalClose.addEventListener("click", function(){
			modalBackground.classList.remove("active");
			modalWindow.classList.remove("active")
	})
	//
	// управление отображениями нажатых кнопок
	let roomBtns = document.querySelectorAll(".button.rooms-item");
	for(let i of roomBtns){
		i.addEventListener("click", function(){
			if(i.classList.contains("active")){
				i.classList.remove("active");
			}else{
				i.classList.add("active");
			}
			onStartFilter();
		})
	}
	let attributeBtns = document.querySelectorAll(".button.sight-item");
	for(let i of attributeBtns){
		i.addEventListener("click", function(){
			if(i.classList.contains("active")){
				i.classList.remove("active");
			}else{
				i.classList.add("active");
			}
			onStartFilter();
		})
	}
	// управление бегунками при их передвижении
	function managementRangeSelect(elem, n, k, minValue, maxValue){ // (целевой элемент, длина шкалы, визуальая поправка)
		let runners = elem.querySelectorAll("input");
		let otherLines = elem.querySelectorAll(".line__end");
		let valueTxts = elem.previousElementSibling.children;
		for(let i = 0; i < runners.length; i++){
			// let runnerValue = runners[i].value;
			if(i == 0){
				runners[i].value = minValue;
				otherLines[i].style.width = "calc(" + runners[i].value/n*100 + "% - " + k + "px)";
				valueTxts[i].innerHTML = runners[i].value;
			}else{
				runners[i].value = maxValue;
				otherLines[i].style.width = "calc(" + (n - runners[i].value)/n*100 + "% + " + k +"px)";
				valueTxts[i].innerHTML = runners[i].value;
			}
			runners[i].addEventListener("input", function(){
				// for(let j = 0; j < otherLines.length; j++){
				// 	if(j == 1){

				// 	}
				// }
				if(i == 0){
					otherLines[i].style.width = "calc(" + runners[i].value/n*100 + "% - " + k + "px)";
				}else{
					otherLines[i].style.width = "calc(" + (n - runners[i].value)/n*100 + "% + " + k +"px)";
				}
				valueTxts[i].innerHTML = runners[i].value;
				onStartFilter();
			})
		}
	}
	// управление кнопкой сброс фильтра
	let pushOnResetBtn = document.querySelector(".button-push.push-on-reset.hovered");
	pushOnResetBtn.addEventListener("click", function(){
		for(let i of roomBtns){
			if(i.classList.contains("active")){
				i.classList.remove("active");
			}
		}
		//
		managementRangeSelect(objectRangePrice, 20, 25, managementDefaultFilterObject['priceInFilter'][0], managementDefaultFilterObject['priceInFilter'][1]);

		managementRangeSelect(objectRangeArea, 200, 0, managementDefaultFilterObject['areaInFilter'][0], managementDefaultFilterObject['areaInFilter'][1]);

		managementRangeSelect(objectRangeFloor, 22, 0, managementDefaultFilterObject['floorInFilter'][0], managementDefaultFilterObject['floorInFilter'][1]);
		//
		for(let i of attributeBtns){
			if(i.classList.contains("active")){
				i.classList.remove("active");
			}
		}
		//
		// giveValuesForInput();
		// mainFilter(managementDefaultFilterObject);
		// drawContent(flatsListAfterFilter, 6, true);

		onStartFilter()
	})
	//
	// управление панели отображения
	//
	// вызов фильтра заного
	function onStartFilter(){
		giveValuesForInput();
		console.log(managementFilterObject);

		mainFilter(managementFilterObject);
		console.log(flatsListAfterFilter);

		drawContent(flatsListAfterFilter, defaultCount, true);
	}
}