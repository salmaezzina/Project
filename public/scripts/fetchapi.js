function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
async function getData() {
  try {
      // hetheya ek sure elli jebt mennou el API https://global-warming.org/
      const res = await fetch('https://cors-anywhere.herokuapp.com/https://global-warming.org/api/temperature-api');
      const data = await res.json();
      console.log(data);

      var rand = getRandomInt(1600);
      var x = data.result[rand];
      console.log(x);
      console.log(45564);

      var parag = document.getElementById("temperature");
      parag.innerHTML = "La temperature globale en l'annee " + rand + " était de " + x.land + " selon l'API de global warming.org";
  } catch(err) {
      console.log(err);
  }
}
getData();
         