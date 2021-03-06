(function(){
    angular.module('timerApp', [])
    .filter('splitTime', function() {
        return function(input, splitChar, splitIndex) {
            return input.split(splitChar)[splitIndex];
        }
    })
    .filter('nonZero', function() {
        return function(inputVal) {
            if(parseInt(inputVal) !== 0)
                return true;
            else
                return false;
        }
    })
    .filter('nonEmpty', function() {
        return function(inputObj) {
            if(angular.equals(inputObj, {}))
                return false;
            else
                return true;
        }
    })
    .filter('timerFormat', function() {
    //Wed, 01 Feb 2017 04:47:21 GMT
        return function(gmtFormat) {
            var dateFormat = gmtFormat.split(" ");
            gmtFormat = dateFormat[1] +"-"+ dateFormat[2] +"-"+ dateFormat[3];
            return gmtFormat;
        }
    })
    .factory('tevotedUpdateService', ['$http', function($http){
        var updateData = function(uriName, dataObj){
            return $http({
              method: 'PUT',
              data: dataObj,
              url: uriName
            })
            .then(function successCallback(response) {
                return response.data;
            })
            .catch(function errorCallback(err) {
                throw err;
            });
        };
        return {updateData:updateData};
    }])
    .factory('tevotedDeleteService', ['$http', function($http){
        var deleteData = function(uriName, dataObj){
            return $http({
              method: 'PUT',
              data: dataObj,
              url: uriName
            })
            .then(function successCallback(response) {
                return response.data;
            })
            .catch(function errorCallback(err) {
                throw err;
            });
        };
        return {deleteData:deleteData};
    }])
    .factory('tevotedService', ['$http', '$q', function($http, $q){
        var getData = function (uriName){
            var deferred = $q.defer();
            $http({
              method: 'GET',
              url: uriName
                }).then(function successCallback(response) {
                    deferred.resolve(response.data);
                }, function errorCallback(response) {
                    deferred.reject(response.data);
            });
            return deferred.promise;
        };
        return {getData:getData};
    }])
    .controller('MainCtrl', ['$scope','tevotedService', 'tevotedUpdateService', 'tevotedDeleteService', function($scope, tevotedService, tevotedUpdateService, tevotedDeleteService) {

        $scope.timerData = [];
        //var uriName = "https://ec2-35-164-183-71.us-west-2.compute.amazonaws.com";
        var uriName = "https://onlimages.com";

        // INITIALIZATION AKA RESET CODE
        $scope.init = function(){
            $scope.timerAction = "START";
            $scope.dynClass = "startTimer";
            $scope.enTimer = false;
            $scope.currentTimer = "";
            $scope.currentIndex = -1;
        };
        $scope.init();
        $scope.tab = 1;
        // END INITIALIZATION AKA RESET CODE

        // TAB CONTROLS
        $scope.setTab = function(newTab){
            /*if(newTab === 1){
              $(".onePanel").css("background-color", "#E0FFFF");
            } else {
              $("body").css("overflow", "auto");
            }*/
          $scope.tab = newTab;
        };
        $scope.isSet = function(tabNum){
          return $scope.tab === tabNum;
        };
        $scope.ifData = function(){
            if($scope.timerData.length === 0) {
                return false;
            }
            return true;
        };
        // END TAB CONTROLS
        
        // UTILITY
        $scope.getTimerData = function() {
            tevotedService.getData(uriName).then(function(result) {
                $scope.timerData = result;
                $(".loader").fadeOut("slow");
            }, function(reject){
                /*showToast("There seems to be a problem. Kindly reload the page", "warning", "show");*/
                showToast("Kindly click <a href='https://onlimages.com' target='_blank'>onlimages</a> and add a security exception in the Advanced settings, to use this app.", "warning", "show");
                console.log('GET rejected');
            });
        };
        $scope.getTimerData();

/*$scope.timerData = [{"timerName": "PRAKASH", "startTime": "Wed, 01 Feb 2017 04:47:21 GMT", "pastData": {}},{"timerName": "DATATEXT23", "startTime": "Wed, 01 Feb 2017 04:47:21 GMT", "pastData": {"12-Jan-2017": "22,23,58", "3-Dec-2015": "0,2,32", "4-Dec-2015": "0,2,32", "5-Dec-2015": "0,2,32", "6-Dec-2015": "0,2,32", "10-Dec-2015": "0,2,32", "12-Dec-2015": "0,2,32", "24-Dec-2015": "0,0,32", "16-Dec-2015": "0,2,32", "30-Nov-2016": "4,30,32"}},{"timerName": "dataOne", "startTime": "", "pastData": {"10-Dec-2015": "0,2,32", "12-Dec-2015": "0,2,32"}}];$(".loader").fadeOut("slow");*/
        
        $scope.saveToServer = function(msg){
            var tmpObj = {
                "_id" : $scope.timerData[$scope.currentIndex]._id,
                "timerName" : $scope.timerData[$scope.currentIndex].timerName,
                "startTime" : $scope.timerData[$scope.currentIndex].startTime,
                "pastData" : $scope.timerData[$scope.currentIndex].pastData,
                "method" : "update"
            };
            tevotedUpdateService.updateData(uriName, tmpObj)
            .then(function(resolved) {
                $scope.timerData = resolved;
                $(".loader").fadeOut("slow");
                if(msg === "START"){
                    showToast("Timer started successfully", "success","hide");
console.log("START - ", $scope.currentTimer, " :TimerName, ", $scope.currentIndex, " :Index, ", $scope.timerData.length, " :Length");   // DEBUG
                }
                else {
                    showToast("Timer stopped", "message","hide");
console.log("STOP - ", $scope.currentTimer, " :TimerName, ", $scope.currentIndex, " :Index, ", $scope.timerData.length, " :Length");   // DEBUG
                }
            })
            .catch(function(errorData) {
                showToast("There seems to be a problem. Kindly reload the page", "warning", "show");
                console.log(msg,' ERROR');
            });
        };
        $scope.findTimer = function (tmpName) {
            var i;
            for(i=0; i < $scope.timerData.length; i++){
                if(tmpName === $scope.timerData[i].timerName){
                    $scope.currentIndex = i;
                    break;
                }
            }
        };
        $scope.isDatePresent = function (tmpDate) {
            var innerIndex = -1;
            var tmpObj = $scope.timerData[$scope.currentIndex].pastData;
            for(var dateKey in tmpObj){
                if(tmpObj.hasOwnProperty(dateKey)){
                    if(dateKey === tmpDate){
                        return true;
                    }
                }
            }
            return false;
        };
        // END UTILITY

        // EVENTS
        $scope.btnTimerClick = function() {
            if($scope.timerAction === "START"){
console.log("TIMERSTART - ", $scope.currentTimer, " :TimerName, ", $scope.currentIndex, " :Index, ", $scope.timerData.length, " :Length");   // DEBUG
                $scope.dynClass = "stopTimer";
                toggleClass("stop");
                $scope.timerAction = "STOP";

                if($scope.currentIndex === -1){
                    $scope.currentIndex = $scope.timerData.length;
                    var tmpData = {};
                    tmpData['_id'] = "";
                    tmpData['timerName'] = $scope.currentTimer;
                    tmpData['startTime'] = "";
                    tmpData['pastData'] = {};
                    $scope.timerData.push(tmpData);
                }
                $scope.timerData[$scope.currentIndex].startTime = getTimeStamp();
                $(".loader").fadeIn("slow");
                $scope.saveToServer("START");
            } else {
console.log("TIMERSTOP - ", $scope.currentTimer, " :TimerName, ", $scope.currentIndex, " :Index, ", $scope.timerData.length, " :Length");   // DEBUG
                $scope.dynClass = "startTimer";
                $scope.timerAction = "START";
                toggleClass("start");
                
                var tmpCurrentTime = getTimeStamp();
                var tmpDate = getDateVal($scope.timerData[$scope.currentIndex].startTime);
                
                var tmpHours = getHourDiff($scope.timerData[$scope.currentIndex].startTime, tmpCurrentTime);
                var tmpMinutes = getMinSecDiff($scope.timerData[$scope.currentIndex].startTime, tmpCurrentTime, "min");
                var tmpSeconds = getMinSecDiff($scope.timerData[$scope.currentIndex].startTime, tmpCurrentTime, "sec");

                tmpHours = parseInt(tmpHours);
                tmpMinutes = parseInt(tmpMinutes);
                tmpSeconds = parseInt(tmpSeconds);

                // ADJUSTMENTS
                if(tmpMinutes !== 0){
                    tmpMinutes--;
                }
                if(tmpHours !== 0){
                    tmpHours--;
                }
                
                if($scope.isDatePresent(tmpDate)){
                    // CUMULATE
                    var tmpCumulate = $scope.timerData[$scope.currentIndex].pastData[tmpDate];
                    var tmpCumArr = tmpCumulate.split(",");
                    tmpHours = parseInt(tmpCumArr[0]) + tmpHours;
                    tmpMinutes = parseInt(tmpCumArr[1]) + tmpMinutes;
                    tmpSeconds = parseInt(tmpCumArr[2]) + tmpSeconds;
                } else {
                    // NEW ENTRY
                    $scope.timerData[$scope.currentIndex].pastData[tmpDate] = "";
                }
                
                // ADJUSTMENTS
                if((tmpSeconds/60) > 1){
                        tmpMinutes = tmpMinutes + parseInt(tmpSeconds / 60);
                        tmpSeconds = (tmpSeconds % 60);
                }
                if((tmpMinutes/60) > 1){
                        tmpHours = tmpHours + parseInt(tmpMinutes / 60);
                        tmpMinutes = (tmpMinutes % 60);
                }
                
                var tmpDuration = tmpHours + "," + tmpMinutes + "," + tmpSeconds;
                $scope.timerData[$scope.currentIndex].pastData[tmpDate] = tmpDuration;
                $scope.timerData[$scope.currentIndex].startTime = "";
                $(".loader").fadeIn("slow");
                $scope.saveToServer("PUT");
            }
        };
        $scope.timerNameClick = function (dataTimerName){
            $scope.init();
            $scope.tab = 1;
            $scope.setTab(1);
            $scope.currentTimer = dataTimerName;
            $scope.btnSelectClick();
        };
        $scope.btnResetClick = function () {
            $scope.init();
            enableInput();
            toggleClass("start");

console.log("RESET - ", $scope.currentTimer, " :TimerName, ", $scope.currentIndex, " :Index, ", $scope.timerData.length, " :Length");   // DEBUG
        };
        $scope.inpKeyPress = function ($event) {
            var tmpKeyCode = $event.which || $event.keyCode;
            if(tmpKeyCode === 13) {
                $event.preventDefault();
                $scope.btnSelectClick();
            } 
        };
        $scope.btnDeleteClick = function (timerName, timerDate, timerVal, evt) {
            if(timerName === $scope.currentTimer){
                evt.stopPropagation();
                showToast("Kindly reset the timer","warning","hide");
            } else {
                $('#modalBtnDelete').off().on('click', function() {
                    // TEMPORARY FIX
                    $scope.init();
                    enableInput();
                    toggleClass("start");
                    // TEMPORARY FIX END

                    evt.stopPropagation();
                    $(".loader").fadeIn("slow");
console.log("BEFORE DELETE - ", $scope.currentTimer, " :TimerName, ", $scope.currentIndex, " :Index, ", $scope.timerData.length, " :Length");   // DEBUG
                    tevotedDeleteService.deleteData(uriName,
                      {
                        timerName:timerName,
                        timerDate:timerDate,
                        timerValue:timerVal,
                        method:"delete"
                      }
                    ).then(function(result){
console.log("AFTERR DELETE - ", $scope.currentTimer, " :TimerName, ", $scope.currentIndex, " :Index, ", $scope.timerData.length, " :Length");   // DEBUG
                        $scope.timerData = result;
                        $(".loader").fadeOut("slow");
                        var tmpToastMsg = '"' + timerName + '" on "' + timerDate + '" is deleted';
                        showToast( tmpToastMsg, "warning", "hide");
                    }).catch(function(errorData) {
                        showToast("There seems to be a problem. Kindly reload the page", "warning", "show");
                        console.log('DELETE ERROR');
                    });
                });
            }  // ELSE
        };
        $scope.btnSelectClick = function () {
            if($scope.currentTimer !== "" && $scope.currentTimer !== undefined){
                $scope.enTimer = true;
                disableInput();

                $scope.findTimer($scope.currentTimer);
                if($scope.currentIndex === -1){
                    // WHEN A NEW ROUTINE IS ADDED
console.log("SELECT NEW - ", $scope.currentTimer, " :TimerName, ", $scope.currentIndex, " :Index, ", $scope.timerData.length, " :Length");   // DEBUG
                } else {
                    if($scope.timerData[$scope.currentIndex].startTime !== ""){
console.log("SELECT RUNNING - ", $scope.currentTimer, " :TimerName, ", $scope.currentIndex, " :Index, ", $scope.timerData.length, " :Length");   // DEBUG
                        $scope.timerAction = "STOP";
                        $scope.dynClass = "stopTimer";
                        toggleClass("stop");
                        showToast("Timer already running", "warning","hide");
                    }
                    else {
                        $scope.timerAction = "START";
                        $scope.dynClass = "startTimer";
console.log("SELECT DATA - ", $scope.currentTimer, " :TimerName, ", $scope.currentIndex, " :Index, ", $scope.timerData.length, " :Length");   // DEBUG
                    }
                }
            }
            else
                showToast("Kindly enter a routine name","warning","hide");
        };
        // END EVENTS

    }]); // MAINCTRL END

})();