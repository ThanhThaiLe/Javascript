function Validator(options) {
  var selectorRules = {};
  function getParent(element, selector) {
    // kiểm tra element có phải là form-group không
    // nếu là form-group thì return là form-group
    // không phải là form-group thì gán lại giá trị và tiếp tục lặp
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      } else {
        element = element.parentElement;
      }
    }
  }
  function Validate(inputElement, element) {
    // value : inputElement.value
    // validator func: element.validator
    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
    //var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
    // lấy các rules của selector
    var rules = selectorRules[element.selector];
    var errorMessage;
    // khi trả về mảng sẽ có lỗi hoặc không
    // nếu có lỗi => errorMessage !=null thì thoát vòng lặp
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](formElement.querySelector(element.selector + ":checked"));
          break;

        default:
          errorMessage = rules[i](inputElement.value);
      }
      // errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
    }
    return !errorMessage;
  }
  var formElement = document.querySelector(options.form);
  if (formElement) {
    formElement.onsubmit = function (event) {
      event.preventDefault();
      var isValid = true;
      options.rules.forEach((element) => {
        var inputElement = formElement.querySelector(element.selector);
        isValid = Validate(inputElement, element);
      });
      if (!isValid) {
        console.log("Có lỗi");
      } else {
        if (typeof options.onSubmit === "function") {
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
          options.onSubmit(formValues);
        } else {
          formElement.onSubmit();
        }
      }
    };

    // xử lý lặp qua các input và xử lý sự kiện check validate
    options.rules.forEach((element) => {
      // lưu lại các rule của inputElement
      if (Array.isArray(selectorRules[element.selector])) {
        selectorRules[element.selector].push(element.validator);
      } else {
        selectorRules[element.selector] = [element.validator];
      }
      // lấy ô input của form
      var inputElements = formElement.querySelectorAll(element.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        // sau đó kiểm tra và check lỗi
        if (inputElement) {
          //xử lý trường hợp blug khỏi input
          inputElement.onblur = () => {
            Validate(inputElement, element);
          };
          // xử lý mỗi khi người dùng nhập
          inputElement.oninput = () => {
            var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
          };
        }
      });
    });
  }
}
// định nghĩa các rule
// nguyên tắc các rule
// khi có lỗi trả ra message lỗi
// hợp lệ không trả ra gì
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    validator: function (value) {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    validator: function (value) {
      var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
      return regex.test(value.trim()) ? undefined : message || "Trường này phải là email";
    },
  };
};
Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    validator: function (value) {
      return value.length >= min ? undefined : message || `Vui lòng nhập vào tối thiểu ${min}`;
    },
  };
};
Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    validator: function (value) {
      return value == getConfirmValue() ? undefined : message || "Giá trị nhập vào không chính xác";
    },
  };
};
