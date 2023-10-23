function Validator(formSelector) {
  var _this = this;
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) return element.parentElement;
      element = element.parentElement;
    }
  }
  var formElement = document.querySelector(formSelector);
  //nếu có lỗi show lỗi
  // không có lỗi show undefined
  var validatorRules = {
    required: function (value) {
      return value ? undefined : "Vui lòng nhập trường này";
    },
    email: function (value) {
      var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
      return regex.test(value.trim()) ? undefined : "Trường này phải là email";
    },
    min: function (min) {
      return function (value) {
        return value.length >= min ? undefined : "Vui lòng nhập " + min + " ký tự";
      };
    },
    max: function (max) {
      return function (value) {
        return value.length >= max ? undefined : "Vui lòng nhập " + max + " ký tự";
      };
    },
  };
  // chỉ xử lý khi có form
  var formRules = {};
  if (formElement) {
    var inputs = formElement.querySelectorAll("[name][rules]");
    for (var input of inputs) {
      var rules = input.getAttribute("rules").split("|");

      for (var rule of rules) {
        var ruleInfo;
        var ruleHasValue = rule.includes(":");
        if (ruleHasValue) {
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
        }
        var ruleFunc = validatorRules[rule];
        if (ruleHasValue) {
          ruleFunc = ruleFunc(ruleInfo[1]);
        }
        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }
      }
      // lắng nghe sự kiện validates
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }
    function handleValidate(event) {
      var rules = formRules[event.target.name];
      var errorMessage;
      for (const rule of rules) {
        errorMessage = rule(event.target.value);
        break;
      }
      // rules.find(function (rule) {
      //   return errorMessage;
      // });
      if (errorMessage) {
        var formGroup = getParent(event.target, ".form-group");
        if (!formGroup) return;
        var formMessage = formGroup.querySelector(".form-message");
        if (formMessage) {
          formMessage.innerText = errorMessage;
          formGroup.classList.add("invalid");
        }
      }
      return !errorMessage;
    }
    function handleClearError(event) {
      var formGroup = getParent(event.target, ".form-group");
      if (!formGroup) return;
      if (formGroup.classList.contains("invalid")) {
        formGroup.classList.remove("invalid");
        var formMessage = formGroup.querySelector(".form-message");
        if (formMessage) {
          formMessage.innerText = "";
        }
      }
    }
  }

  // xử lý hành vi submit form submit
  formElement.onsubmit = function (event) {
    event.preventDefault();

    var inputs = formElement.querySelectorAll("[name][rules]");
    var isValid = true;
    for (var input of inputs) {
      if (!handleValidate({ target: input })) {
        isValid = false;
      }
    }
    if (isValid) {
      debugger;
      if (typeof _this.onSubmit === "function") {
        var enableInput = formElement.querySelectorAll("[name]");
        var formValues = Array.from(enableInput).reduce(function (values, input) {
          switch (input.type) {
            case "file":
              values[input.name] = input.files;
              break;
            case "radio":
              values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
              break;
            case "checkbox":
              if (!input.matches(":checked")) {
                values[input.name] = [];
                return values;
              }
              if (!Array.isArray(values[input.name])) {
                values[input.name] = [];
              }
              values[input.name].push(input.value);
              break;

            default:
              values[input.name] = input.value;
              break;
          }
          return values;
        }, {});
        _this.onSubmit(formValues);
      } else {
        formElement.submit();
      }
    }
  };
}
