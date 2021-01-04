import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/jsm/controls/OrbitControls.js';
import Stats from '/jsm/libs/stats.module.js';
//import '/sortingAlgorithms.js';

/** 
 *  Klassen
 * */ 
class AnimationStep{    //Ein Schritt von der Animation der immer auf einmal ausgeführt wird
    constructor(array){
        this.array = array; 
    }
}
class Animation {
    run (){
        console.error("Oberklasse aufgerufen, function nicht überschrieben");
    }    
}
class AllStandardAnimation extends Animation{
    run(){
        pillars.forEach(pillar => {
            pillar.setColor(STANDARD_COLOR);
        });
    }
}
class ColorAnimation extends Animation {
    constructor(color,index){
        super();
        this.tag = "color";
        this.color = color;
        this.index = index;
    }
    run(){
        pillars[this.index].setColor(this.color);
    }
}
class HeightChangeAnimation extends Animation{
    constructor(index,height,delay){ //delay true false
        super();
        this.index = index;
        this.height = height;
        this.delay = delay;
    }
    run(){
        if(this.delay){
            window.setTimeout(() => {
                pillars[this.index].setHeight(this.height);  
            }, speed/2);
        }else{
            pillars[this.index].setHeight(this.height);
        } 
    }
}
class ComparisonCount extends Animation {
    run(){
        editCounter(false,true);
    }
}
class AccessCount extends Animation {
    run(){
        editCounter(false,false);
    }
}
class Pillar {  //Werte als Pillar
    constructor(box,value,index){
        this.box = box;
        this.value = value;
        this.setHeight(value);
        this.index = index;
    }
    setHeightAndValue(value){
        this.value = value;
        this.setHeight(value);
    }
    setHeight (height){
        if(this.box!=null){
            this.box.scale.y = 1;
            this.box.scale.y = height;
            this.box.position.y = height/2;
        }
    }
    setColor (color){
        this.box.material.color = new THREE.Color(color);
    }
}
//ENDE Klassen

//Globale Attribute
const STANDARD_COLOR = 0xff0000;
const CHANGE_COLOR = 0xff00ff;
const FIELD_COLOR = 0x880000;

const BUBBLE_COMPARSION = 0x0000ff;
const BUBBLE_END = 0x00ff00;
const MERGE_BORDER = 0x0000ff;
const MERGE_POSITION = 0x00ff00;
const QUICK_PIVOT = 0x0000ff;
const PILLAR_SIZE = 5;
const PILLAR_DISTANCE = 1;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
let  camera, dirLight;
const offset = document.getElementById("menue").offsetHeight;
const sliderCount = document.getElementById("sliderCount");
const sliderSpeed = document.getElementById("sliderSpeed");
let height;
let animations = [];
let pillars = [];
let sortet = [];
let speed = 100;
let countComparasion = 0;
let arrayAccesses = 0;
let sorting;
//Ende Attribute 

/**
 * Update/Event/Animation functions 
 */
 function update() {
    requestAnimationFrame(update);
    controls.update();
    render();
    //stats.update();
};
function render() {
    renderer.render(scene, camera);
}
window.addEventListener('resize', () => { //resize update
    height = window.innerHeight -offset;
    camera.aspect = window.innerWidth / height;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, height);
    render();
}, false);
//Slider Numerfield Update
sliderCount.oninput = function() {
    let ausgabe = "";
    if(this.value<100){
        ausgabe = "0";
    }
    ausgabe+=this.value;
    document.getElementById("numberDisplay").innerHTML = ausgabe; 
}
//Slider Speed Update
sliderSpeed.oninput = function() {
    let ausgabe = "";
    if(this.value<100){
        ausgabe = "0";
    }
    if(this.value<10){
        ausgabe += "0";
    }
    ausgabe+=this.value;
    document.getElementById("speedDisplay").innerHTML = ausgabe;
    speed = this.value; 
}
//AnzeigeVergleiche
function editCounter(reset,comparison){
    let comparisionDisplay = document.getElementById("countComparasion");
    let accessDislay = document.getElementById("arrayAccesses");
    if(reset){
        countComparasion = 0;
        comparisionDisplay.innerHTML = "000";
        arrayAccesses = 0;
        accessDislay.innerHTML = "000";
    }else{
        
        let comparison_access;
        let text;

        if (comparison) {
            countComparasion++;
            comparison_access = countComparasion;
            text = comparisionDisplay;
        }else{
            arrayAccesses++;
            comparison_access = arrayAccesses;
            text = accessDislay;
        }
        
        let x1000 = Math.floor(comparison_access /1000);
        let x = comparison_access % 1000;
        if(x<100){
            x = "0"+ x;
        }
        if(x<10){
            x = "0"+ x;
        }
        if(x1000==0){
            text.innerHTML = x;
        }else{
            text.innerHTML = x1000+"."+x;
        }
        
    }
}
//EventListener Buttons
document.getElementById("generateButton").addEventListener('click', event => {
    if (!sorting) {
        window.setTimeout(() => { //Delay damit Lädt angezeigt wird
            generateButtonClicked();
        }, 1);
        document.getElementById("info").innerHTML = "Lädt... <br> Bitte warten!";
    }else{
        document.getElementById("info").innerHTML = "Sorting in progess";
        window.setTimeout(() => { //Delay damit Lädt angezeigt wird
            document.getElementById("info").innerHTML = "";
        }, 1000);
    }
});
document.getElementById("sortButton").addEventListener('click', event => {
    if (!sorting) {
        sortButtonClicked();
    } else {
        document.getElementById("info").innerHTML = "Sorting in progess";
        window.setTimeout(() => { //Delay damit Lädt angezeigt wird
            document.getElementById("info").innerHTML = "";
        }, 1000);
    }
});
document.getElementById("bubbleSortText").addEventListener('click', event => {
    document.getElementById("bubbleSort").checked = true;
});
document.getElementById("mergeSortText").addEventListener('click', event => {
    document.getElementById("mergeSort").checked = true;
});
document.getElementById("quickSortText").addEventListener('click', event => {
    document.getElementById("quickSort").checked = true;
});
document.getElementById("heapSortText").addEventListener('click', event => {
    document.getElementById("heapSort").checked = true;
});
document.getElementById("log").addEventListener('click', event => {
    console.log({camera});
    pillars = [];
    pillars.push(new Pillar (null, 18, 0));
    pillars.push(new Pillar (null, 28, 1));
    pillars.push(new Pillar (null, 29, 2));
    pillars.push(new Pillar (null, 19, 3));
    pillars.push(new Pillar (null, 23, 4));
    pillars.push(new Pillar (null, 17, 5));
    pillars.push(new Pillar (null, 17, 6));
    pillars.push(new Pillar (null, 22, 7));
    pillars.push(new Pillar (null, 19, 8));
    pillars.push(new Pillar (null, 34, 9));
    pillars.push(new Pillar (null, 40, 10));
    console.dir(pillars);
});
//Update/Event functions ENDE

//Button Click functions
function generateButtonClicked(){
    
        pillars.forEach(pillar => {
            scene.remove(pillar.box);
        });
        pillars.length = 0;
        createPillars(sliderCount.value);
        document.getElementById("info").innerHTML = "" ;
}
function sortButtonClicked(){
    sorting=true;
    editCounter(true,true);
    if(document.getElementById("bubbleSort").checked){
        console.log("Bubble Sort in Progress");
        bubbleSort();
    }else if(document.getElementById("mergeSort").checked){
        console.log("Merge Sort in Progress");
        mergeSortStart();
    }else if(document.getElementById("quickSort").checked){
        console.log("Quick Sort in Progress");
        quickSortStart();
    }else if(document.getElementById("heapSort").checked){
        console.log("Heap Sort in Progress");
        heapSort(pillars);
    }else{
        console.error("Radio Button not found");
        sorting = false;
    }
}
//Button Click functions ENDE

function animate() {             //Steuert Animation der Visualisierung 

    if (animations.length != 0) {  //wird so lange mit delay aufgerufen bis alle Animationsschritte fertig sind
        window.setTimeout(() => {
            let step = animations.shift(); //Ein Schritt wird komplett ausgegführt
            step.array.forEach(element => {
                element.run();
            });
            animate();
        }, speed);
    } else {
        animationDone();
    }
}
function animationDone(){
    console.log("Animation Done");
    pillars.forEach(element => {
        element.setColor(0x008800);
    });
    sorting = false;

    if (sortet != 0) {
        pillars.forEach(element => {
            element.value = sortet.shift().value;
        });
    }

}
/**
 *  ENDE Update/Event/Animation functions 
 */


/**
 * Sortieralgorithmen 
 */
function bubbleSort(){ //über Animationsklassen

    let length = pillars.length
    for (let j = 0; j < pillars.length; j++) {
        for (let i = 0; i < length; i++) {

            let step = [];
            step.push(new ColorAnimation(BUBBLE_END,length-1)); //Ende 
            step.push(new ColorAnimation(BUBBLE_COMPARSION,i)); //Vergleich 

            if(i===0&&length!==pillars.length){
                step.push(new ColorAnimation(STANDARD_COLOR,length-1)); //nicht betrachteter Wert wird wieder rot
                step.push(new ColorAnimation(STANDARD_COLOR,length));   //nicht betrachteter Wert wird wieder rot
            }
            if(i>0){ //Verleich

                if(pillars[i].value<pillars[i-1].value){
                
                    step.push(new HeightChangeAnimation(i,pillars[i-1].value,true));  //wechselt die zwei
                    step.push(new HeightChangeAnimation(i-1,pillars[i].value,true));  //Werte die getauscht werden müssen
                    step.push(new AccessCount());
                    step.push(new AccessCount());

                    let val1 = pillars[i].value;
                    pillars[i].value = pillars[i-1].value;
                    pillars[i-1].value = val1;            

                }
                step.push(new ComparisonCount()); //erhöht Counter zum richtigen Zeitpunkt
            }
            if(i > 1){
                step.push(new ColorAnimation(STANDARD_COLOR,i-2)); //nicht betrachteter Wert wird wieder rot
            }
            animations.push(new AnimationStep(step));   //Ein Schritt der Animation wird abgeschlossen
        }
        length--;
    }
    sortet = 0;
    animate();  //Animation wird gestartet
}
/*function bubbleSort(index, count) { //Rekursiver Bums

    let length = pillars.length - count;
    pillars[length - 1].box.material.color = new THREE.Color(0x00ff00); //Aktueller Endpunkt grün
    if (length == 1) { //Bubble Sort zuende
        window.setTimeout(() => {
            pillars[0].box.material.color = new THREE.Color(0xff0000); //Endpunkt entfernen
        }, speed);
        sorting = false;
    } else {
        if (count < pillars.length) {

            window.setTimeout(() => {
                if (index == length - 1) { 
                    pillars[index -1].box.material.color = new THREE.Color(0xff0000);
                    pillars[index].box.material.color = new THREE.Color(0xff0000);
                }else{
                    pillars[index].box.material.color = new THREE.Color(0x0000ff); //visualisierung
                    pillars[index+1].box.material.color = new THREE.Color(0x0000ff); //visualisierung
                    if (index > 0) {
                        pillars[index -1].box.material.color = new THREE.Color(0xff0000);
                    }
                }
            }, speed/2);

            if (index > 0) { //Verleich
                if (pillars[index].value < pillars[index - 1].value) {
                    swapPillars(index, index - 1);
                }
                editComparasionCounter(1);
            }


            window.setTimeout(() => {
                if (index < length - 1) { //nächter Vergleich in der Reihe
                    bubbleSort(++index, count);
                } else {  //Reihe zuende
                    pillars[index - 1].box.material.color = new THREE.Color(0xff0000);
                    pillars[index].box.material.color = new THREE.Color(0xff0000);
                    bubbleSort(0, ++count);
                }
            }, speed);
        }
    }
}*/
/*
window.setTimeout(() => { 
            }, speed);
            */
function mergeSortStart(){
   
    let copy = [] ;
    for (let i = 0; i < pillars.length; i++) {
        copy.push(new Pillar(null,pillars[i].value,i));    
    }
    sortet = mergeSort(copy.slice(),pillars.length-1);

    animate();
}
function mergeSort(list) {

    if (list.length <= 1) {
        return list;
    } else {
        let left = [];  //teilen
        let right = [];
        let half = Math.floor(list.length / 2);

        for (let i = 0; i < half; i++) {
            left.push(list.shift());
        }
        if (list.length == 0) {
        
        } else {
            while (list.length != 0) {
                right.push(list.shift());
            } //teilen zuende
        }

        left = mergeSort(left); 
        right = mergeSort(right);
        return merge(left, right);
  

    }
}
function merge(left,right){

    let startIndex = left[0].index;

    let temp = [];
    while(left.length!=0 && right.length!=0){
        if(left[0].value<=right[0].value){
            temp.push(left.shift());
        }else{
            temp.push(right.shift());
        }
        addMergeAnimation(startIndex,left,right,temp,true); //Jedes mal wenn ein Element gemerged wird AnimationStep (Vergleich wurde durchgeführt)
    }
    while (left.length!=0) {
        temp.push(left.shift());
        addMergeAnimation(startIndex,left,right,temp,false);  //Ohne Vergleich
    }
    while (right.length!=0) {
        temp.push(right.shift());
        addMergeAnimation(startIndex,left,right,temp,false);  //Ohne Vergleich
    }
    
    return temp;
}
function addMergeAnimation(startIndex,left,right,temp,comparison){

    let step = [];
    step.push(new AllStandardAnimation());
    step.push(new AccessCount());

    for (let i = startIndex; i < startIndex+temp.length+left.length+right.length; i++) {
        step.push(new ColorAnimation(FIELD_COLOR,i));
    }

    if (temp.length > 0) {
        step.push(new ColorAnimation(MERGE_POSITION, startIndex + temp.length - 1));
    }
    
    step.push(new ColorAnimation(MERGE_BORDER,startIndex));
    step.push(new ColorAnimation(MERGE_BORDER,startIndex+temp.length+left.length+right.length-1));
    if(comparison){
        step.push(new ComparisonCount());
    }
    
    step.push(new HeightChangeAnimation(startIndex+temp.length-1,temp[temp.length-1].value,false));  //gemergedes Element im neuem array
    temp[temp.length-1].index = startIndex+temp.length-1;

    for (let i = 0; i < left.length; i++) {     //alle anderen werden verschoben erst im linken Array
        let index = startIndex+temp.length+i;
        left[i].index = index;    
        step.push(new HeightChangeAnimation(index,left[i].value,false));    
    }
    for (let i = 0; i < right.length; i++) {  //dann im rechtem Array
        let index = startIndex+left.length+temp.length+i;
        right[i].index = index;    
        step.push(new HeightChangeAnimation(index,right[i].value,false));    
    }
    animations.push(new AnimationStep(step));
}
function quickSortStart(){
    
    quickSort(0,pillars.length-1);
    console.dir(pillars);

    animate();
}
function quickSort(start, end){ //Pivot at the end In-Place
    if(start < end ){
        let index = split(start, end); //index = index of Pivot
        quickSort(start,index-1); //on the left  of Pivot                               //quickSort(start+index-1); keine zwei Parameter + statt ,
        quickSort(index+1,end);   //on the right of Pivot
    }
}

function split(start, end) {  //Animation color aktuelles Pivot, start, end? HeightChange color delay ? 
    
    let step = [];
    let i = start;
    let j = end - 1; //on the left of pivot
    let pivot = pillars[end].value;

    colorQuick(start,end,step);

    while (i < j) {

        step.push(new ComparisonCount());
        while (i < end && pillars[i].value < pivot) { //Searching for a element greater than pivot
            step.push(new ComparisonCount());

            step.push(new ColorAnimation(0x00ff00,i));
            step.push(new ColorAnimation(0x00ff00,j));
            animations.push(new AnimationStep(step));
            step = [];
            colorQuick(start,end,step);

            i++;
        }
        step.push(new ComparisonCount());
        while (j > start && pillars[j].value >= pivot) { ////Searching for a element smaller than pivot
            step.push(new ComparisonCount());
            
            step.push(new ColorAnimation(0x00ff00,j));
            step.push(new ColorAnimation(0x00ff00,i));
            animations.push(new AnimationStep(step));
            step = [];
            colorQuick(start,end,step);

            j--;
        }
        if (i < j) { //swap 
            let tmp = pillars[i].value;
            pillars[i].value = pillars[j].value;
            pillars[j].value = tmp;
            step.push(new HeightChangeAnimation(i,pillars[i].value,true));
            step.push(new HeightChangeAnimation(j,pillars[j].value,true));
            step.push(new ColorAnimation(CHANGE_COLOR,i));
            step.push(new ColorAnimation(CHANGE_COLOR,j));
            step.push(new AccessCount());
            step.push(new AccessCount());

            animations.push(new AnimationStep(step));
            step = [];
            colorQuick(start,end,step);
            
        }
    }

    if (pillars[i].value > pivot) { //swap
        pillars[end].value = pillars[i].value;
        pillars[i].value = pivot;
        step.push(new HeightChangeAnimation(end,pillars[end].value,true));
        step.push(new HeightChangeAnimation(i,pillars[i].value,true));
        step.push(new ColorAnimation(CHANGE_COLOR,end));
        step.push(new ColorAnimation(QUICK_PIVOT,i));
        step.push(new AccessCount());
        step.push(new AccessCount());
    }

    
    animations.push(new AnimationStep(step));
    return i; //position of pivot
}

function colorQuick(start,end,step){
    step.push(new AllStandardAnimation());
    for (let i = start; i < end; i++) {
        step.push(new ColorAnimation(FIELD_COLOR,i));        
    }
    step.push(new ColorAnimation(QUICK_PIVOT,end));
}
function heapSort(list){

    let step = [];
    
    let pow = 0;
    let x = 0;

    for (let i = 0; i < pillars.length; i++) {
        x++;
        if (x == 2 ** pow) {
            pow++;
        }
        
    }

    buildHeap(list);
    for (let i = list.length-1; i > 0; i--) { //swap than heapify (fix)
        let tmp = list[0].value;
        list[0].value = list[i].value;
        list[i].value = tmp;
        heapify(list,i,0); // from i to list.lenght already sortet, length = i
    }
    console.dir(pillars);
}  
function buildHeap(list){
    let lastNode = Math.floor(list.length /2) -1;
    for (let i = lastNode; i >=0 ; i--) {
        heapify(list, list.length,i);       //ever node from bottom to top        
    }
}
function heapify(list, length, parantIndex) {

    while (true) {
        let leftIndex = (parantIndex * 2) + 1;
        let rightIndex = (parantIndex * 2) + 2;

        let largestIndex = parantIndex;
        if (leftIndex < length && list[leftIndex].value > list[largestIndex].value) {
            largestIndex = leftIndex;
        }
        if (rightIndex < length && list[rightIndex].value > list[largestIndex].value) {
            largestIndex = rightIndex;
        }

        if(largestIndex == parantIndex){ //right order -> stop
            break;
        }else{  //swap
            let tmp = list[largestIndex].value;
            list[largestIndex].value = list[parantIndex].value;
            list[parantIndex].value = tmp;
            parantIndex = largestIndex; //proof changed parent
        }
    }
}
//ENDE Sortieralgorithmen

/**
 * Säulen erstellen/ Größe verändern/ Tauschen
 */
function createPillars(count){
    
    const distance = PILLAR_SIZE + PILLAR_DISTANCE;
    const start = -(count*distance/2)
    const end = Math.abs(start);
    //const group = new THREE.Group();
    //group.castShadow = true;

    for  (let i= start;  i<end;   i+=distance){
        let value = Math.floor(Math.random()*count*2+10) +5; 
        let box = createBox(i,PILLAR_SIZE);
        let pillar = new Pillar (box,value,pillars.length);
        scene.add(pillar.box); 
        //group.add(pillar.box);
        pillars.push(pillar);
        
    }
    //scene.add(group);
    console.dir(pillars);
}
function createBox(x,size){   //Create a sphere that cast shadows (but does not receive them)

    if(x==null){
        x=0;
    }
    const geometry = new THREE.BoxBufferGeometry( size, 1, size, 1,1,1 );
    const material = new THREE.MeshPhongMaterial( { color: STANDARD_COLOR } );
    const box = new THREE.Mesh( geometry, material );
    box.castShadow = true; //default is false
    box.receiveShadow = false; //default

    box.position.set(x,0,0);

    return box;
}
//ENDE Säulen

/**
 * Szene erstellen/ Camera/ Licht/ Boden
 */
function addRendener(){ //Create a WebGLRenderer and turn on shadows in the renderer
    height = window.innerHeight-offset;
    renderer.setSize(window.innerWidth, height);
    renderer.setClearColor("#0088ff");
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    document.body.appendChild(renderer.domElement);
}
function addDirectionalLight(){
    dirLight = new THREE.DirectionalLight( 0xffffff, 1, 2000 );
    dirLight.position.set( 1000, 3000, 3000 );
    dirLight.castShadow = true; // default false
    scene.add( dirLight );

    dirLight.shadow.mapSize.width = 10000;
    dirLight.shadow.mapSize.height = 10000; 
    dirLight.shadow.camera.near = 3000; 
    dirLight.shadow.camera.far = 6000;
    dirLight.shadow.camera.left   = -3000; //size
    dirLight.shadow.camera.right  = 3000;  //size
    dirLight.shadow.camera.top    = 1000;  //size
    dirLight.shadow.camera.bottom = -1000; //size
}
function addAmbientLight(){
    const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );
}
function addPlane(){
    //Create a plane that receives shadows (but does not cast them)
    const planeGeometry = new THREE.PlaneBufferGeometry( 1000000, 1000000, 32, 32 );
    const planeMaterial = new THREE.MeshPhongMaterial( { color: 0x006637 } );
    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.rotation.x = -Math.PI/2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    scene.add(plane);
}
function addCamera(x,y,z,fov){
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth /height, 0.1, 10000);
    camera.position.set(x,y,z);
    camera.lookAt(new THREE.Vector3(0,0,100000000));
    
}
//ENDE Szene

/*
const stats = Stats();
document.body.appendChild(stats.dom);*/

function start(){
    addRendener();
    //addCamera(-120,140,110,120); //Position X, Y, Z, FOV
    addCamera(0,20,100,120); //Position X, Y, Z, FOV
    addDirectionalLight();
    addAmbientLight();
    addPlane();
    console.groupCollapsed("Three JS Scene Elements");
    console.dir(scene);
    console.dir(camera);
    console.groupEnd();

    createPillars(sliderCount.value);
}
    

start();
const controls = new OrbitControls(camera, renderer.domElement);
update();

/*//camra helper 
const helper = new THREE.CameraHelper( dirLight.shadow.camera );
scene.add( helper );*/