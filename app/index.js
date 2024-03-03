//https://cf.nascar.com/live/feeds/live-feed.json

var liveFeedData;
var liveOps;
var settings;
var highlightedDrivers = [];

// This issues the GET request
const getLiveFeed = () => {
  $.ajax({
      url: "https://cf.nascar.com/live/feeds/live-feed.json",
      dataType: "json",
      async: false, // Set this to false for synchronous request
      success:  function(data){
            console.log("getLiveFeed success ", data);
            liveFeedData = data;
        }
    });
};

const getLiveOps = () => {
  $.ajax({
      url: "https://cf.nascar.com/live-ops/live-ops.json",
      dataType: "json",
      async: false, // Set this to false for synchronous request
      success: function(data){
        console.log("getLiveOps success ", data);
        liveOps = data;
      }
    });
};

const createLeaderboard = (data, highlightedDrivers) => {
    $("#leaderboard tbody").empty(); //clear existing leaderboard

    let currentLap = data.lap_number;

    data.vehicles.forEach((driver) => {
        let driverName = driver.driver.full_name;
        let driverPosition = driver.running_position;
        let driverDelta = driver.delta;
        let driverPitStops = driver.pit_stops;

        let lastPitLap;
        let driverPitStopsFiltered;

        if (driverPitStops.length > 1 && driverPitStops.filter(v=> v.pit_in_elapsed_time > 0).length > 0) {
            driverPitStopsFiltered = driverPitStops.filter(v=> v.pit_in_elapsed_time > 0); // filters out 0 second pit stops
            lastPitLap = driverPitStopsFiltered[driverPitStopsFiltered.length - 1].pit_in_leader_lap; //pit_in_lap_count is driver's lap, pit_in_leader_lap is race lap
        } else {
            lastPitLap = 0;
        }


        let lastLapTime = driver.last_lap_time
        let averagePos = driver.average_running_position.toFixed(1);
        let startingPos = driver.starting_position;
        let manufacturer = driver.vehicle_manufacturer;
        let driverNum = driver.vehicle_number;
        let dvpClock = driver.is_on_dvp;
        let onTrack = driver.is_on_track;
        let driverStatus = driver.status;

        let manufacturerIMG;

        switch (manufacturer) {
            case "Tyt":
                manufacturerIMG = "toyota.png";
                break
            case "Frd":
                manufacturerIMG = "ford.png";
                break
            case "Chv":
                manufacturerIMG = "chevy.png";
                break
        }

        var playoffDriver;
        if (driver.driver.is_in_chase){
            playoffDriver = $("html").css("--Color_LightYellow");
        } else {
             playoffDriver = "#ffffff00";
         };

        var driverHighlight;
        if ( highlightedDrivers.includes(driverName) ) {
//            driverHighlight = $("html").css("--Color_LightGray");
            driverHighlight = "#606061"
        } else {
            driverHighlight = "#ffffff00";
        };

        var dvpClockHighlight;
        if(dvpClock) {
            dvpClockHighlight = "#8F0000";
        } else {
            dvpClockHighlight = "#ffffff00";
        };

        var onTrackHighlight;
        if(onTrack) {
            onTrackHighlight = "#ffffff00";
        } else { //onTrack = false if pitting & in garage
            switch (driverStatus) {
                case 1: // running (?)
                    onTrackHighlight = $("html").css("--Color_LightYellow");
                    break
                case 2: // not posting a Q time (?)
                    // based on 46, 30, 25 being 2 during truck qual 10/20
                    onTrackHighlight= "#e15e15" // orange
                    break
                case 3: // out of race (?)
                    onTrackHighlight = "#8F0000"; // dark red
                    break
                case 4: // ?
                    onTrackHighlight= "#3FAD30" // green
                    break
                case 5: // ?
                    onTrackHighlight= "#2DD5DF" // aqua
                    break
                case 6:
                    /*
                    looked like status 6 happened before status 3 for Lally, who was on DVP
                    Stenhouse status 6 when car on fire and went to 3 only after race complete. Not on DVP, maybe 6 means in garage but not necessarily OUT (although the fire really means out...)
                    */
                    onTrackHighlight = "#B80000"; // brighter red to study
                    break
                default:
                    onTrackHighlight = "#FF10F0"; //neon pink to alert me to fix
            }
        };


        let leaderboardList =
            $(`<tr>
                <td style="width: 30px;text-align:right;">${driverPosition}</td>
                <td style="width: 0px;background-color: ${playoffDriver}"></td>
                <td style="width: 30px;text-align:right;">${driverNum}</td>
                <td><img src="media/${manufacturerIMG}" width="20px" height="7px"></td>
                <td style="width: 220px;background-color: ${driverHighlight};">${driverName}</td>
                <td style="width: 60px;text-align:right;">${driverDelta}</td>
                <td style="width: 60px;text-align:right;">${lastLapTime}</td>
                <td style="width: 60px;text-align:right;">${lastPitLap}</td>
                <td style="width: 60px;text-align:right;">${averagePos}</td>
                <td style="width: 60px;text-align:right;">${startingPos}</td>
                <td style="width: 45px;background-color: ${onTrackHighlight};"></td>
                <td style="width: 45px;background-color: ${dvpClockHighlight};"></td>
            </tr>`);


        $("#leaderboard tbody").append(leaderboardList);
//        console.log(leaderboardList)
    })

};

const getFlagDetails = (data) => {
    $(".flagDetails").empty(); //clear existing details

    let totalLaps = data.laps_in_race;
    let currentLap = data.lap_number;
    let elapsedTime = new Date(data.elapsed_time * 1000).toISOString().slice(11, 19);

    var flagColor;
    var flagImage;

    switch (data.flag_state) {
        case 1: // green
            flagColor = $("html").css("--Color_Green");
            flagImage = "none";
            break
        case 2: // caution
            flagColor = $("html").css("--Color_Yellow");
            flagImage = "none";
            break
        case 3: // red
            flagColor = $("html").css("--Color_Red");
            flagImage = "none";
            break
        case 4: // checkered
            flagColor = "#ffffff00";
            flagImage = "URL(media/checkered.jpg)";
            break
        case 5: // white
            flagColor = $("html").css("--Color_White");
            flagImage = "none";
            break
        case 8: // warm up
            flagColor = $("html").css("--Color_DarkGray");
            flagImage = "none";
            break
        case 9: // inactive/blue flag
            flagColor = $("html").css("--Color_Blue");
            flagImage = "none";
            break
        default:
            flagColor = $("html").css("--Color_Blue");
            flagImage = "none";
    }

    let lapDetails = $(`<h1 style="background-color: ${flagColor}; background-image: ${flagImage};">Lap ${currentLap} / ${totalLaps}</h1>`);

    $(".flagDetails").append(lapDetails);
//    console.log(lapDetails);
}

const getRaceDetails = (data) => {
    $(".raceDetails").empty(); //clear existing details

    let raceName = data.run_name;
    let trackName = data.track_name;
    let seriesNum = data.series_id;

    var seriesName;
    var seriesLogo;

    switch (seriesNum) {
        case 1:
            seriesName = "Cup";
//            seriesLogo = "nascar_cup_series_logo.svg";
            seriesLogo = "https://www.nascar.com/wp-content/uploads/sites/7/2023/05/12/nascar_cup_series_logo.svg";
            break;
        case 2:
            seriesName = "Xfinity?";
            seriesLogo = "https://www.nascar.com/wp-content/uploads/sites/7/2023/05/12/nascar_xfinity_series_logos.svg";
            break;
        case 3:
            seriesName = "Truck?";
            seriesLogo = "https://www.nascar.com/wp-content/uploads/sites/7/2023/05/12/nascar_craftsman_truck_series_logo.svg";
            break;
        case 4:
            seriesName = "Arca?";
            seriesLogo = "https://www.nascar.com/wp-content/uploads/sites/7/2021/04/24/arcalogoftr.jpg";
            break;
        default:
            seriesName = "Series?";
            break;
    }

    const seriesImage = `url('${seriesLogo}')`;
    const raceDetailsDiv = document.querySelector('.raceDetails');

    raceDetailsDiv.style.backgroundImage = seriesImage;
    raceDetailsDiv.style.backgroundSize = 'auto 50%';
    raceDetailsDiv.style.backgroundPosition = 'right bottom';
    raceDetailsDiv.style.backgroundRepeat = 'no-repeat';

    let raceDetails = $(`<h1>${raceName}</h1><h2>${trackName}</h2>`);

    $(".raceDetails").append(raceDetails);


}

const createSettingsDrivers = (data) => {
//    $("").empty();

    let drivers = data.vehicles;

    // Sort drivers by name
    drivers.sort((a, b) => {
        let nameA = a.driver.last_name.toLowerCase(); // Case-insensitive sorting
        let nameB = b.driver.last_name.toLowerCase();

        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });

    // Append sorted drivers as checkboxes
    drivers.forEach((driver) => {
        let driverName = driver.driver.full_name;
        let driverId = driver.driver.driver_id;

        let driverSelection = $(`
        <input type="checkbox" id="driver${driverId}" name="item" value="${driverName}">
        <label for="driver${driverId}">${driverName}</label><br>
        `);

        $(".driverSelection").append(driverSelection);
    });

}

function openSettings() {
    console.log("hello");
    settings.classList.add("settings-open");
}

function closeSettings() {
    console.log("goodbye");
    settings.classList.remove("settings-open");
}

// Triggered by "Save" button in Settings
function saveSettings() {
    console.log("pending save: ", highlightedDrivers);

    highlightedDrivers = [];

    const checkboxes = document.querySelectorAll('input[name="item"]:checked');
    checkboxes.forEach((checkbox) => {
        highlightedDrivers.push(checkbox.value);
    })

    console.log("saving", highlightedDrivers);
    closeSettings();
    setUp(); // Resets leaderboard w/ highlights
}


const setUp = () => {
    getLiveFeed();
    createLeaderboard(liveFeedData, highlightedDrivers);
    getFlagDetails(liveFeedData);


};


const updateContent = () => {
    setUp();

    settings = document.getElementById("settings");
    createSettingsDrivers(liveFeedData);

    // Fetch data every 5 seconds (source only refreshes every 30 seconds)
    setInterval(setUp, 5000);

    getLiveOps();
    getRaceDetails(liveFeedData);


    // Fetch data every 1 seconds
//    setInterval(setUp, 1000);
}



$(document).ready(updateContent);