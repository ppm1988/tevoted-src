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
    /*.factory('tevotedFactory', ['$http', '$q', function($http, $q){
        var deferred = $q.defer();
        var getData = function (uriName){
            $http({
              method: 'GET',
              url: uriName
                }).then(function successCallback(response) {
                    deferred.resolve(response.data);
                }, function errorCallback(response) {
                    console.log('Error', response.data);
            });
            return deferred.promise;
        };
        return {getData:getData};
    }])*/
    .factory('tevotedService', ['$http', '$q', function($http, $q){
        var deferred = $q.defer();
        var getData = function (uriName){
            $http({
              method: 'GET',
              url: uriName
                }).then(function successCallback(response) {
                    deferred.resolve(response.data);
                }, function errorCallback(response) {
                    console.log('Error', response.data);
            });
            return deferred.promise;
        };
        return {getData:getData};
    }])
    .controller('MainCtrl', ['$scope','tevotedService', function($scope, tevotedService) {
        /*$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";*/

        $scope.timerData = [];
        var uriName = 'data/data.json';

        $scope.getUsersFromLocal = function() {
            tevotedService.getData(uriName).then(function(result) {
                $scope.timerData = result;
            });
        };
        $scope.getUsersFromLocal();

        // INITIALIZATION AKA RESET CODE
        $scope.init = function(){
            $scope.tab = 1;
            $scope.timerAction = "START";
            $scope.dynClass = "startTimer";
            $scope.enTimer = false;
            $scope.currentTimer = "";
            $scope.currentIndex = -1;
        };
        $scope.init();
        // END INITIALIZATION AKA RESET CODE

        // TAB CONTROLS
        $scope.setTab = function(newTab){
            /*if(newTab === 1){
              $("#div_innerData").css("background-color", "#E0FFFF");
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
        $scope.saveToFile = function(){
            /*$http.post($scope.uriBuilder, $scope.timerData).then(function(data) {
                console.log(data);
            });*/
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
                $scope.dynClass = "stopTimer";
                $scope.timerAction = "STOP";
                if($scope.currentIndex === -1){
                    $scope.currentIndex = $scope.timerData.length;
                    var tmpData = {};
                    tmpData['timerName'] = $scope.currentTimer;
                    tmpData['startTime'] = "";
                    tmpData['pastData'] = {};
                    $scope.timerData.push(tmpData);
                }
                $scope.timerData[$scope.currentIndex].startTime = getTimeStamp();
                showToast("Timer started successfully", "success");
            } else {
                $scope.dynClass = "startTimer";
                $scope.timerAction = "START";
                
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
                showToast("Timer stopped", "message");
                $scope.saveToFile();
            }
        };
        $scope.btnResetClick = function () {                
            $scope.init();
            enableInput();
        };
        $scope.inpKeyPress = function ($event) {
            var tmpKeyCode = $event.which || $event.keyCode;
            if(tmpKeyCode === 13) {
                $event.preventDefault();
                $scope.btnSelectClick();
            } 
        };
        $scope.btnSelectClick = function () {
            if($scope.currentTimer !== "" && $scope.currentTimer !== undefined){
                $scope.enTimer = true;
                disableInput();

                $scope.findTimer($scope.currentTimer);
                if($scope.currentIndex === -1){

                } else {
                    if($scope.timerData[$scope.currentIndex].startTime !== ""){
                        $scope.timerAction = "STOP";
                        $scope.dynClass = "stopTimer";
                        showToast("Timer already running", "warning");
                    }
                    else {
                        $scope.timerAction = "START";
                        $scope.dynClass = "startTimer";
                    }
                }
            }
            else
                showToast("Kindly enter a timer name","warning");
        };
        // END EVENTS

    }]); // MAINCTRL END

})();