let fileContent;
// get text from file
async function readFile(filePath){
// read text from URL location
return fetch(filePath)
  .then((response) => response.text())
  .then((responseData) => {
    // console.log(responseData);
    return responseData;
  })
  .catch(error => console.log(error));
}
// get count and words
function occurancesCount(fileContent){
    let wordMap = {};
    let strArray = fileContent.replace(/[^a-zA-Z ]/g, "").split(' ');

    for(let i =0; i< strArray.length;i++){
        if(wordMap[strArray[i]]){
            wordMap[strArray[i]]++;
        }else {
            wordMap[strArray[i]] = 1;
        }
    }

        let mapToArray = []
        for(let i in wordMap){
            let obj = {
                word: i,
                count: wordMap[i]
             };
            mapToArray.push(obj);
        }
   const mapSort = mapToArray.sort((a, b) => b.count - a.count);
   return mapSort.slice(0, 10);

}
// construct 10 urls array
function constructUrls(occuranceCount){
    const APIkey = 'dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf';
    return occuranceCount.map(each => {
        return `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=${APIkey}&lang=en-ru&text=${each.word};`;
    });  
}
// each APi call
function getApiCall(url){
    return fetch(url)
        .then((response) => response.json())
        .then((responseData) => {
          // console.log(responseData);
          return responseData;
        })
        .catch(error => console.log(error));
}
// All call using promise.all
function getAllDetails(url){
        return Promise.all(url.map(getApiCall));
}


async function findInDictionary(occuranceCount){
    let urls = await constructUrls(occuranceCount);
    let response = await getAllDetails(urls).then(resp => resp).catch(e=>{console.log(e)});
    let outputArray = [];
    for(let i = 0; i< occuranceCount.length; i++){
        let foundObj = response.find(ele => 
            ele && ele.def && ele.def.length && ele.def[0].text ? occuranceCount[i].word === ele.def[0].text : null);
        if(foundObj){
            let obj = {
            ...occuranceCount[i],
            def: foundObj
        };
        outputArray.push(obj);
       } else {
        let obj = {
            ...occuranceCount[i],
            def: []
        };
        outputArray.push(obj);
       }
    } return outputArray;
}
// main function where we have all methods
async function main(){
    // 'https://norvig.com/big.txt' - huge dot set slowing down development added temp file with some file content
    await readFile('http://127.0.0.1:5500/word.text').then(response => fileContent = response);
    let occuranceCount = await occurancesCount(fileContent);
    console.log(occuranceCount);
    let outputDictionary = await findInDictionary(occuranceCount);
    console.log(outputDictionary);
    $('body').append(outputDictionary.map(each => {
        return `
            <div class="column">
            <div class="card">
            <p class="p-name"> Word: ${each.word}</p>
            <p class="p-loc"> Count: ${each.count}</p>
            <p class="p-desc"> Pos: ${each.def && each.def && each.def.def ? each.def.def.map(ele => ele.pos) : null}</p>
            </div>
            </div>
        `;
      }));
}
main();