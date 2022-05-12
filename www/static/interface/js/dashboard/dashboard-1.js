const gaugeCPU = document.getElementById("gaugeCPU")
const gaugeMEM = document.getElementById("gaugeMEM") 

update()

function update() {
    //perform a get request to /repage/api/stats
    fetch("/repage/api/stats")
        .then(response => response.json())
        .then(data => {
            console.log(data)
            //set the gauge value
            setGaugeValue(gaugeCPU, data.cpu);
            //set the memory value
            setGaugeValue(gaugeMEM, data.usedmemory / data.totalmemory);
            //call the function again after 1 second
        })
    setTimeout(update, 1500);
}