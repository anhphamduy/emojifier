const status = ["Convert to indices", "Get embeddings", "Get prediction"];

const sm = `
    <div class="input-group mb-3">
        <input id="sentence" type="text" placeholder="Sentence" class="form-control col-12" aria-label="Text input with radio button">
    </div>
    <div class="input-group mb-3">
        <select class="custom-select col-12 sm" id="num_emos">
            <option id="temp" selected># emojis</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
        </select>
    </div>
    <div class="input-group mb-3 input-group-prepend">
        <button class="btn btn-outline-secondary d-block mx-auto" id="get_emos" type="button">Get emojis</button>
    </div>
`;

const lg = `
    <div class="input-group mb-3">
        <div class="input-group-prepend">
            <button class="btn btn-outline-secondary" id="get_emos" type="button">Get emojis</button>
        </div>
        <select class="custom-select col-3" id="num_emos">
            <option id="temp" selected># emojis</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
        </select>
        <input id="sentence" type="text" placeholder="Sentence" class="form-control col-9" aria-label="Text input with radio button">
    </div>
`;

$.fn.extend({
  animateCss: function(animationName, callback) {
    var animationEnd = (function(el) {
      var animations = {
        animation: "animationend",
        OAnimation: "oAnimationEnd",
        MozAnimation: "mozAnimationEnd",
        WebkitAnimation: "webkitAnimationEnd"
      };

      for (var t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement("div"));

    this.addClass("animated " + animationName).one(animationEnd, function() {
      $(this).removeClass("animated " + animationName);

      if (typeof callback === "function") callback();
    });

    return this;
  }
});

const getEmojis = async (sentence, num_of_emos) => {
  const data = await fetch("https://emojify.pythonanywhere.com/predict", {
    method: "POST",
    body: JSON.stringify({ sentence, num_of_emos }),
    headers: { "Content-Type": "application/json" }
  });

  if (!data.ok) {
    getWarningMessage("Speelings are wrong or words do not exist");
    return false;
  }

  const result = await data.json();
  return { result, sentence };
};

const FadeIn = (selector, callback = function() {}) => {
  $(selector).animate(
    {
      opacity: 1
    },
    1000,
    callback
  );
};

const FadeOut = (selector, callback = function() {}) => {
  $(selector).animate(
    {
      opacity: 0
    },
    1000,
    callback
  );
};

const detectSize = () => {
  if ($(window).width() < 768) {
    return "sm";
  } else if ($(window).width() >= 768 && $(window).width() <= 992) {
    return "sm";
  }
  return "lg";
};

const getWarningMessage = message => {
  $.notify(
    {
      title: "<strong>Warning: </strong>",
      message,
      placement: {
        from: "top",
        align: screenSize == "sm" ? "middle" : "right"
      }
    },
    {
      type: "warning"
    }
  );
};

$(document).ready(function() {
  const screenSize = detectSize();
  console.log(screenSize);
  if (screenSize === "sm") {
    $("#main").html(sm);
  } else {
    $("#main").html(lg);
  }

  $(window).resize(function() {
    if (detectSize() !== screenSize) {
      location.reload();
    }
  });

  $("#get_emos").click(function() {
    const num_emos = $("#num_emos").val();
    const sentence = $("#sentence")
      .val()
      .trim();

    if (isNaN(num_emos)) {
      getWarningMessage("Please choose number of emojis");
    } else if (!sentence) {
      getWarningMessage("Sentence can't be missing");
    }

    if (!isNaN(num_emos) && sentence) {
      $("#status-text").animateCss("fadeOutLeft", function() {
        $("#status-text").css("display", "none");
      });
      FadeIn(".spinner");
      $("#get_emos").prop("disabled", true);
      $.when(getEmojis(sentence, num_emos)).then(emoji => {
        if (!emoji) {
          console.log("Hi");
          FadeOut(".spinner");
          $("#get_emos").prop("disabled", false);
        } else {
          let result = "";
          Object.keys(emoji.result).forEach(
            item => (result += emoji.result[item])
          );

          FadeOut(".spinner");
          setTimeout(() => {
            $("#status-text").text(`${emoji.sentence} ${result}`);
            $("#status-text").css("display", "block");
            $("#status-text").animateCss("fadeInRight");
            $("#get_emos").prop("disabled", false);
          }, 1200);
        }
      });
    }
  });
});
