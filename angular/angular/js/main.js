/// <reference path="angular.min.js" />
/// <reference path="jquery-1.11.3.min.js" />

angular.module('main', ['common'])
.controller('mainCtrl', ['$scope', '$http', '$q', '$timeout', '$document', function ($scope, $http, $q, $timeout, $document) {
    $scope.data = {};

    $scope.setMessage = function (ngModelControl, message) {
        if (message != null) {
            ngModelControl.$setValidity(message, false);
        } else {
            for (var ex in ngModelControl.$error) {
                ngModelControl.$setValidity(ex, true);
            }
            ngModelControl.$setValidity(ngModelControl.$name, true);
        }
    }

    $scope.card_number_check = function (ngModelControl, val, scope) {
        var number = (val || '').replace(/\s/g, '');
        var message = (number.length > 0 ? message : '请输入卡号') ||
            (/^\d{13,20}$/.test(number) ? message : '您输入的卡号有误，请检查并重新输入');
        scope.setMessage(ngModelControl, message);
    };

    $scope.month_check = function (ngModelControl, val, scope) {

        var month = (scope.form1.month.$viewValue || ''), year = (scope.form1.year.$viewValue || '');
        var total = year + month;
        if (total.length == 0) {
            message = '请输入卡有效期';
        }
        else if (month == '00' || !/^\d{4}$/.test(total)) {
            message = '请输入正确的卡有效期';
        }
        else {
            var date = new Date();
            message = Number(total) < Number(String(date.getFullYear()).substring(2)) * 100 + (date.getMonth() + 1)
                            ? '请输入正确的卡有效期' : null;
        }
        scope.setMessage(scope.form1.month, message);
    };

    $scope.cvv_check = function (ngModelControl, val, scope) {
        var cvv = val || "";
        var message = (cvv.length > 0 ? message : '请输入信用卡背面签名条处的后3位数字') ||
                        (/^\d+$/.test(cvv) ? message : '验证码只能使用数字，请重新输入') ||
                        (/^\d{3}$/.test(cvv) ? message : '输入有误，请重新输入信用卡背面签名条处的后3位数字');
        scope.setMessage(ngModelControl, message);
    };

    $scope.holder_check = function (ngModelControl, val, scope) {
        val = val || "";
        var message;
        if (!/^[\u4e00-\u9fa5 \- a-zA-Z]+$/.test(val)) {
            message = '姓名中只能包含汉字/英文字母';
        }
        else if (val.length + (val.match(/[\u4e00-\u9fa5]/g) || []).length > 50) {
            message = '请正确填写持卡人姓名：姓名不能超过25个汉字';
        }
        scope.setMessage(ngModelControl, message);
    };

    $scope.id_type_check = function (ngModelControl, val, scope) {
        scope.id_number_check(scope.form1.id_number, scope.form1.id_number.$viewValue, scope);
    };

    $scope.id_number_check = function (ngModelControl, val, scope) {
        var number = (val || '');
        var type = scope.form1.id_type.$viewValue;
        var message;
        if (number.length == 0) {
            message = '请输入银行存证件号码';
        }
        else {
            switch (String(type)) {
                case "1":
                    message = isIDChinese(number) ? message : '您输入的身份证号码有误，请检查并重新输入';
                    break;
                case "4": case "23": case "26":
                    message = /^[\u4e00-\u9fa5a-zA-Z0-9()]+$/.test(number) ? message : '请正确输入持卡人证件号码：号码中只能包含汉字、字母、数字和半角括号';
                    break;
                default:
                    message = /^[a-zA-Z0-9()]+$/.test(number) ? message : '请正确输入持卡人证件号码：证件号只能包含字母、数字和半角括号';
                    break;
            }
        }

        scope.setMessage(ngModelControl, message);
    };

    $scope.phone_check = function (ngModelControl, val, scope) {
        var phone = (val || '');
        var message = (phone.length > 0 ? message : '请输入银行留存手机号码') ||
                        (/^[1]\d{10}$/.test(phone) ? message : '您输入的手机号有误,请重新输入');
        scope.setMessage(ngModelControl, message);
    };

    $scope.sms_code_check = function (ngModelControl, val, scope) {
        var code = (val || '');
        var message = (/^\d{6}$/.test(code) ? null : '请输入6位数字验证码');
        scope.setMessage(ngModelControl, message);
    };

    $scope.checkData = function (scope, needCheck) {
        if (!needCheck || needCheck.length == 0)
            return;
        var result = true;
        for (var i = 0; i < needCheck.length; i++) {
            scope.$apply(
                function () {
                    scope.form1[needCheck[i]].$pristine = false;
                    scope[needCheck[i] + "_check"](scope.form1[needCheck[i]], scope.form1[needCheck[i]].$viewValue, scope);
                    result = result && scope.form1[needCheck[i]].$valid;
                }
            );
        }
        return result;
    }

} ]);


angular.module('common', [])
.directive('numberFormat', function () {
    return {
        require: 'ngModel',
        link: function (scope, ele, attrs, ctrl) {
            ctrl.$formatters.push(function (value) {
                return (value ? value.replace(/\s/g, '').
                        replace(/(\d{4})(?=\d)/g, "$1 ") : (value));
            });
            scope.$watch(attrs.ngModel, function () {
                if (ctrl.$pristine)
                    return;
                var input = ele.val();
                if (!ctrl.$isEmpty(input)) {
                    for (var i = 0; i < ctrl.$formatters.length; i++) {
                        input = ctrl.$formatters[i](input);
                    }
                }
                ele.val(input);
            });
        }
    };
})
.directive('payRequired', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            var $input = $(element);
            var $parent = $input.parents('[ng-form]');
            var form = $parent.attr('ng-form');
            var field = attrs.ngModel;
            var model;
            var type = element[0].type;

            function validate(value) {
                if (!ctrl.$pristine)
                    scope.$eval(attrs.payRequired)(ctrl, value, scope);
                return value;
            }
            ctrl.$parsers.push(validate);
            ctrl.$formatters.push(validate);
        }
    };
}).directive('show', function () {//（2014-12-03）
    return function (scope, element, attrs) {
        scope.$watch(attrs.show, function (result) {
            if (result != null) {
                $(element)[result ? 'show' : 'hide']();
            }
        });
    };
})
.directive('sendSms', ['$q', '$timeout', '$http', function ($q, $timeout, $http) {
    return function (scope, element, attrs) {//银行验证码
        var countDown = scope[attrs["sendSms"]] = { hint: "获取验证码", seconds: 0 };
        element.on('click', function () {
            if (!scope.checkData(scope, ["card_number", "month", "cvv", "holder", "id_number", "phone"])) return;

            var _this = this;
            if (scope[$(_this).attr("send-sms")].seconds > 0)
                return;
            scope[$(_this).attr("send-sms")].seconds = 10;
            (function count() {
                var m = scope[$(_this).attr("send-sms")];
                var seconds = m.seconds;
                if (seconds == 0) {
                    m.hint = '获取验证码';
                    return;
                }
                else {
                    m.hint = seconds + '秒';
                    $timeout(function () {
                        m.seconds = (--seconds);
                        count(m);
                    }, 1000, true);
                }
            })();

            var form = scope.data;
            var date = (form.year || '') + (form.month || '');
            date = (date.length > 0 ? String(new Date().getFullYear()).substring(0, 2) : '') + date;
            $http.post('./SendMessage', {
                Phone: form.phone,
                CardNumber: (form.card_number || '').replace(/\s/g, ''),
                CVV2: form.cvv,
                Validity: date,
                CardHolder: form.holder,
                IdCardType: form.id_type,
                IdNumber: form.id_number
            }).then(function (result) {
                try {
                    var data = angular.fromJson(result.data);

                }
                catch (e) {

                }
            });
        });
    };
} ])
.filter('alert', function () {
    return function (errors) {
        var reason = null;
        for (var error in errors) {
            if (errors[error] == true) { reason = error; break; }
        }
        return reason;
    };
});


function isIDChinese(number) {//【“身份证”】
    number = String(number).toLowerCase();
    function isDateLegal(y, m, d) {
        var st = [m, d, y.length < 4 ? '19' + y : y].join('/').replace(/\b0/g, ''),
                                            dt = new Date(Date.parse(st));
        return [dt.getMonth() + 1, dt.getDate(), dt.getFullYear()].join('/') == st;
    }
    function checkDate(y, m, d) {
        var st = [m, d, y.length < 4 ? '19' + y : y].join('/').replace(/\b0/g, '');
        var dt = new Date(Date.parse(st));
        return [dt.getMonth() + 1, dt.getDate(), dt.getFullYear()].join('/') == st;
    }
    if (/^\d{15}$/.test(number)) {
        return checkDate.apply(null, number.match(/^.{6}(..)(..)(..)/).slice(1));
    }
    if (/^\d{17}[\dx]$/i.test(number)) {
        var sum = 0, times = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        for (var i = 0; i < 17; i++)
            sum += parseInt(number.charAt(i), 10) * times[i];
        if ("10x98765432".charAt(sum % 11) != number.charAt(17))
            return false;
        return isDateLegal.apply(null, number.match(/^.{6}(.{4})(..)(..)/).slice(1));
    }
    return false;
}