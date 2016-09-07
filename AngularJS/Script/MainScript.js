var SERVERURL = "http://167.114.247.58/";
var LOGSHEETURL = "api/Logsheet";
var LOGINURL = "api/Account/Login";
var LOGURL = "api/Log";
var TOKEN = '';
var GROUPID = '';
var USERID = '';

var contr = angular.module('angularBasic', []);
contr.controller('ApiController', function ($scope, $http) {
    $scope.period = false;
    $scope.PeriodList = [];
    $scope.LogSheetsAll = [];
    $scope.LogSheetsOnForm = [];
    $scope.InfoList = [];
    $scope.userName = 'test';
    $scope.userPass = 'test';
    $scope.isAutorized = false;

    //var config = {
    //    headers: {
    //        'Content-Type': 'application/x-www-form-urlencoded'
    //    }
    //}
    $scope.ShowPeriodButtons = function () {
        $scope.period = !$scope.period;
    }
    //querys {{{
    $scope.GetInfoByLogshets = function (data) {
        $scope.InfoList = [];
        var res = $scope.sendRequest(LOGURL + '/GetLogByLogsheetId', 'GET', { logsheetId: data });
        for (var i in res) {
            $scope.InfoList.push({ Time: res[i].logs.Time, Type: '???', Keywords: res[i].keywords[0].Content.toString(), Names: "???", Quality: res[i].logs.Quality });
        }
    }
    $scope.LoadLogSheets = function () {
        var res = $scope.sendRequest(LOGSHEETURL + '/GetLogsheetByGroupId', 'GET', { groupId: GROUPID, UserId: USERID });
        for (var i in res) {
            $scope.LogSheetsAll.push({ Logsheetid: res[i].Logsheetid, Name: res[i].Name, Dateevent: new Date(res[i].Dateevent) });
        }
        $scope.FilterLogshets('Free');
        //$scope.LogSheets = [{ Id: '1', Name: 'First LogSheet' }, { Id: '2', Name: 'Two LogSheet' }, { Id: '3', Name: 'Thee LogSheet' }];
    }
    //querys }}}



    //pagination of logshets {{{
    $scope.pageNumber = 0;
    $scope.pageDisplayed = function () {
        return $scope.pageNumber + 1;
    };
    $scope.nbPerPage = 12;
    $scope.LogSheetsOnFormPagin1 = function () {
        var first = $scope.pageNumber * $scope.nbPerPage;
        $scope.LogSheetsOnFormPagin = $scope.LogSheetsOnForm.slice(first, first + $scope.nbPerPage);
    };
    $scope.totalPages = function () {
        var div = Math.floor($scope.LogSheetsOnForm.length / $scope.nbPerPage);
        div += $scope.LogSheetsOnForm.length % $scope.nbPerPage > 0 ? 1 : 0;
        return div - 1;
    };
    $scope.hasPrevious = function () {
        return $scope.pageNumber !== 0;
    };
    $scope.hasNext = function () {
        return $scope.pageNumber !== $scope.totalPages();
    };
    $scope.next = function () {
        if ($scope.pageNumber < $scope.totalPages()) {
            $scope.pageNumber = $scope.pageNumber + 1;
        }
        $scope.LogSheetsOnFormPagin1();
    }
    $scope.previous = function () {
        if ($scope.pageNumber != 0) {
            $scope.pageNumber = $scope.pageNumber - 1;
        }
        $scope.LogSheetsOnFormPagin1();
    }
    //pagination of logshets }}}


    $scope.FilterLogshets = function (data) {
        $scope.LogSheetsOnForm = [];
        switch (data) {
            case 'Today': {
                var td = new Date(new Date(Date.now()).toDateString());
                for (var i in $scope.LogSheetsAll) {
                    if (td <= $scope.LogSheetsAll[i].Dateevent)
                        $scope.LogSheetsOnForm.push({ Id: $scope.LogSheetsAll[i].Logsheetid, Name: $scope.LogSheetsAll[i].Name });
                }
                break;
            }
            case 'Last2': {
                var td = new Date(new Date(Date.now() - 60 * 60 * 24 * 1000).toDateString());
                for (var i in $scope.LogSheetsAll) {
                    if (td <= $scope.LogSheetsAll[i].Dateevent)
                        $scope.LogSheetsOnForm.push({ Id: $scope.LogSheetsAll[i].Logsheetid, Name: $scope.LogSheetsAll[i].Name });
                }
                break;
            }
            case 'Yesterday': {
                var df = new Date(new Date(Date.now() - 60 * 60 * 24 * 1000).toDateString());
                var dt = new Date(new Date(Date.now()).toDateString());
                for (var i in $scope.LogSheetsAll) {
                    if (df <= $scope.LogSheetsAll[i].Dateevent && dt > $scope.LogSheetsAll[i].Dateevent)
                        $scope.LogSheetsOnForm.push({ Id: $scope.LogSheetsAll[i].Logsheetid, Name: $scope.LogSheetsAll[i].Name });
                }
                break;
            }
            case 'Last7': {
                var td = new Date(new Date(Date.now() - 7 * 60 * 60 * 24 * 1000).toDateString());
                for (var i in $scope.LogSheetsAll) {
                    if (td <= $scope.LogSheetsAll[i].Dateevent)
                        $scope.LogSheetsOnForm.push({ Id: $scope.LogSheetsAll[i].Logsheetid, Name: $scope.LogSheetsAll[i].Name });
                }
                break;
            }
            case 'Free': {
                for (var i in $scope.LogSheetsAll) {
                    $scope.LogSheetsOnForm.push({ Id: $scope.LogSheetsAll[i].Logsheetid, Name: $scope.LogSheetsAll[i].Name });
                }
                break;
            }
            default:
        }
        $scope.LogSheetsOnFormPagin1();
    }

    $scope.sendRequest = function (_url, _met, _param) {
        if (TOKEN === "") {
            alert("You need to authorize!");
            return;
        }
        var res = '';
        $.ajax({
            type: _met,
            url: SERVERURL + _url,
            async: false,
            contentType: "application/json",
            crossDomain: true,
            //dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + TOKEN);
            },
            success: function (data) {
                if (data.meta.Code === 200)
                    res = data.data;
                else
                    alert(data.meta.ErrorMessage);
            },
            error: function (data) {
                alert('Error read: ' + data.responseText);
            },
            data: _param,
            //accept: 'application/json'
        });

        return res;
    }

    $scope.init = function () {
        $scope.initParam();
    }

    $scope.loginInSystem = function () {
        //$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
        //$http.defaults.headers.post['dataType'] = 'json';
        //$http.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
        //$http.defaults.headers.post['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
        //dataType: 'json',
        //$http({
        //    url: SERVERURL + LOGINURL,
        //    method: 'post',
        //    data: JSON.stringify({ user: 'test', password: '37268335dd6931045bdcdf92623ff819a64244b53d0e746d438797349d4da578' }),
        //    headers: {
        //        "Content-Type": "application/json",
        //    }
        //}).
        // success(function (data) {
        //     TOKEN = data;
        // });
        $.ajax({
            type: "POST",
            url: SERVERURL + LOGINURL,
            success: function (data) {
                if (data.meta.Code === 200) {
                    TOKEN = data.data.Token;
                    GROUPID = data.data.Usermodel.GroupID;
                    USERID = data.data.Usermodel.Id;
                    $scope.isAutorized = true;
                    $scope.$apply();
                }
                else {
                    alert(data.meta.ErrorMessage);
                    $scope.isAutorized = false;
                    $scope.$apply();
                }
            },
            error: function (data) {
                alert(data.responseText);
                $scope.isAutorized = false;
                $scope.$apply();
            },
            data: { user: $scope.userName, password: Sha256.hash($scope.userPass) },
            accept: 'application/json'
        });
        //console.log($scope.isAutorized);
        //'9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    }

    $scope.initParam = function () {
        $scope.PeriodList.push({ Id: 'Today', Name: 'Today' });
        $scope.PeriodList.push({ Id: 'Last2', Name: 'Last 2' });
        $scope.PeriodList.push({ Id: 'Yesterday', Name: 'Yesterday' });
        $scope.PeriodList.push({ Id: 'Last7', Name: 'Last 7' });
        $scope.PeriodList.push({ Id: 'Free', Name: 'Free' });
    }
});
