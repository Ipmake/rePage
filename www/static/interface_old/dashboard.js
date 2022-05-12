const CPUgauge = document.getElementById("gauge_CPU");
const MEMgauge = document.getElementById("gauge_MEM")

update()

function update() {
    //perform a get request to /repage/api/stats
    fetch("/repage/api/stats")
        .then(response => response.json())
        .then(data => {
            console.log(data)
            //set the gauge value
            setGaugeValue(CPUgauge, data.cpu);
            //set the memory value
            setGaugeValue(MEMgauge, data.usedmemory / data.totalmemory);
            //call the function again after 1 second
        })
    setTimeout(update, 1500);
}