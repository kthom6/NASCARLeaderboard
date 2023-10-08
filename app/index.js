//https://cf.nascar.com/live/feeds/live-feed.json

var liveFeedData;

const successfullyExecutedAPI = (data) => {
    console.log("successAPI ", data);
    liveFeedData = data;

};

// This issues the GET request
const getLiveFeed = () => {
  $.ajax({
      url: "https://cf.nascar.com/live/feeds/live-feed.json",
      dataType: "json",
      async: false, // Set this to false for synchronous request
      success: successfullyExecutedAPI
    });
};

const createLeaderboard = (data) => {
    $("#leaderboard tbody").empty(); //clear existing leaderboard

    let currentLap = data.lap_number;

    data.vehicles.forEach((driver) => {
        let driverName = driver.driver.full_name;
        let driverPosition = driver.running_position;
        let driverDelta = driver.delta;
        let driverPitStops = driver.pit_stops;
        let lastPitLap;

        if (driver.pit_stops.length > 1) {
            lastPitLap = driverPitStops[driverPitStops.length - 1].pit_in_lap_count;
        } else {
            lastPitLap = 0;
        }

//        if (driverPitStops.hasOwnProperty('driverPitStops')) {
//            let lastPitLap = driverPitStops[driverPitStops.length - 1].pit_in_lap_count;
//        } else {
//            let lastPitLap = 0;
//        }

//        let lastPitLap = driverPitStops[driverPitStops.length - 1].pit_in_lap_count;

        let averagePos = driver.average_running_position;
        let manufacturer = driver.vehicle_manufacturer;
        let driverNum = driver.vehicle_number;
        let dvpClock = driver.is_on_dvp;
        let onTrack = driver.is_on_track;

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
        if (driverName == "AJ Allmendinger"
            || driverName == "Ross Chastain (P)"
            || driverName == "Mike Rockenfeller"
            || driverName == "") {
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
        } else {
            if (currentLap - lastPitLap <= 3){
                onTrackHighlight = $("html").css("--Color_LightYellow"); //I think it shows onTrack = false if pitting
            } else {
                onTrackHighlight = "#8F0000";
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
                <td style="width: 60px;text-align:right;">${lastPitLap}</td>
                <td style="width: 60px;text-align:right;">${averagePos}</td>
                <td style="width: 45px;background-color: ${onTrackHighlight};"></td>
                <td style="width: 45px;background-color: ${dvpClockHighlight};"></td>
            </tr>`);


        $("#leaderboard tbody").append(leaderboardList);
//        console.log(leaderboardList)
    })

};

const getRaceDetails = (data) => {
    $(".raceDetails").empty(); //clear existing details

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

    $(".raceDetails").append(lapDetails);
//    console.log(lapDetails);
}


const setUp = () => {
    getLiveFeed();
    createLeaderboard(liveFeedData);
    getRaceDetails(liveFeedData);


};


const updateContent = () => {
    setUp();

    // Fetch data every 10 seconds (source only refreshes every 30 seconds)
    setInterval(setUp, 10000);


    // Fetch data every 1 seconds
//    setInterval(setUp, 1000);
}



$(document).ready(updateContent);