(function () {
  'use strict';

  angular.module('aDash', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/', {
        templateUrl: 'templates/face-recognition.html',
        controller: 'faceRecCtrlr'
      }).when('/emotions', {
        templateUrl: 'templates/emotions.html',
        controller: 'emotionCtrlr'
      }).when('/hall_of_fame', {
        templateUrl: 'templates/hall_of_fame.html',
        controller: 'hallOfFameCtrlr'
      });
    }])
    .directive('elemReady', function ($parse) {
      return {
        restrict: 'A',
        link: function ($scope, elem, attrs) {
          elem.ready(function () {
            $scope.$apply(function () {
              var func = $parse(attrs.elemReady);
              func($scope);
            })
          })
        }
      }
    })
    .controller('parentCtrlr', ['$scope', '$rootScope', '$interval', function ($scope, $rootScope, $interval) {

      // Default values
      $rootScope.refreshTimerId = 0;
      $rootScope.face_tracker = null;
      $rootScope.checkForFaces = null;
      $rootScope.savedEmotions = {
        sad: {
          amount: 0,
          img: "img/CIC_Assets-02.png"
        },
        happy: {
          amount: 0,
          img: "img/CIC_Assets-02.png"
        },
        calm: {
          amount: 0,
          img: "img/CIC_Assets-02.png"
        },
        disgusted: {
          amount: 0,
          img: "img/CIC_Assets-02.png"
        },
        angry: {
          amount: 0,
          img: "img/CIC_Assets-02.png"
        },
        surprised: {
          amount: 0,
          img: "img/CIC_Assets-02.png"
        }
      };
      $rootScope.hallOfFame = {
        sad: [],
        happy: [],
        calm: [],
        disgusted: [],
        angry: [],
        surprised: [],
        celebrity: []
      }

      // Rootscope functions
      $rootScope.clearHallOfFame = function () {
        for (var key in $rootScope.hallOfFame) {
          for (var i = 0; i < 3; ++i) {
            $rootScope.hallOfFame[key].push({
              amount: 0,
              img: "img/CIC_Assets-02.png",
              name: "-",
              celebImg: "img/CIC_Assets-02.png",
              barId: key + "-bar-" + i
            })
          }
        }
      }
      $rootScope.clearHallOfFame();

      $rootScope.compareValues = function (key, amount, img, celebImg, name) {
        if (key == "sad" || key == "happy" || key == "calm" || key == "angry" || key == "disgusted" || key == "surprised" || key == "celebrity") {
          $rootScope.hallOfFame[key].push({
            amount: parseFloat(amount).toString(),
            img: img,
            name: name,
            celebImg: celebImg
          });
          $rootScope.hallOfFame[key].sort(function (a, b) {
            return b.amount - a.amount;
          });
          $rootScope.hallOfFame[key].splice(-1);
        }
      }

      $rootScope.toDataURL = function (src, callback, outputFormat) {
        console.log('Converting image to data URL.')
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
          var canvas = document.createElement('CANVAS');
          var ctx = canvas.getContext('2d');
          var dataURL;
          canvas.height = this.naturalHeight;
          canvas.width = this.naturalWidth;
          ctx.drawImage(this, 0, 0);
          dataURL = canvas.toDataURL(outputFormat);
          callback(dataURL);
        };
        img.src = src;
        if (img.complete || img.complete === undefined) {
          img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
          img.src = src;
        }
      }

      $rootScope.resetPage = function () {
        console.log('Resetting page.')
        jQuery("img#celebrity").attr("src", "img/CIC_Assets-02.png");
        jQuery("#match-bar").text("");
        jQuery("h3#name").text("");
        jQuery("#name_of_person").text("");
        jQuery("#title_of_person").text("");
        jQuery("#department_of_person").text("");
        jQuery("#emotion_label").hide();
        jQuery('#emoji').hide();
      }

      $rootScope.getInfo = function (dataImage, options) {
        return new Promise(resolve => {
          $.ajax({
            type: "POST",
            crossDomain: true,
            contentType: "application/json",
            url: "https://{lambda-url}.lambda-url.us-west-2.on.aws/",
            dataType: "json",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            },
            data: JSON.stringify({
              "image": dataImage.replace("data:image/jpeg;base64,", ""),
              options
            }),
            success: function (response, textStatus, jqXHR) {
              document.getElementById("loader").style.display = 'none';
              console.table("Response from getInfo: ", response)
              resolve(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.log(errorThrown);
            }
          });
        })
      }

      $scope.$on('$routeChangeStart', function (scope, next, current) {
        jQuery("#faceRecLink").removeClass("selectedlink");
        jQuery("#emotionLink").removeClass("selectedlink");
        jQuery("#hallOfFameLink").removeClass("selectedlink");

        if (next.$$route.controller == "faceRecCtrlr") {
          jQuery("#faceRecLink").addClass("selectedlink");
        } else if (next.$$route.controller == "emotionCtrlr") {
          jQuery("#emotionLink").addClass("selectedlink");
        } else if (next.$$route.controller == "hallOfFameCtrlr") {
          jQuery("#hallOfFameLink").addClass("selectedlink");
        }

        if (current != null && current.$$route.controller == "faceRecCtrlr") {
          $interval.cancel($rootScope.takePicInter2);
          $interval.cancel($rootScope.takePicInter);
          $interval.cancel($rootScope.celebInter);
          $interval.cancel($rootScope.infoInter);
          $interval.cancel($rootScope.checkForFaces);
          $rootScope.face_tracker.stop();
        }
      });

    }])
    // Controller for /
    .controller('faceRecCtrlr', ['$scope', '$rootScope', '$interval', function ($scope, $rootScope, $interval) {

      // Define default values
      $scope.count = 0;
      $scope.target = document.getElementById('celebrity');
      $scope.video = document.getElementById('video');
      $scope.canvas, $scope.img_base64;
      $scope.info;
      $scope.previousPersonId = "";
      $scope.data_mqtt_send = "";
      $scope.same = false;
      $scope.celebrityMatched = false;
      $scope.name = "";
      $scope.image_base64_global = '';
      $scope.running = true;
      $rootScope.videoUrl = "";

      //        var canvas =  document.getElementById("videoSource");
      //        canvas.width = 1000;
      //        canvas.height = 1000;

      //            var cImage = new Image;
      //            cImage.src  ="http://10.211.232.5/snapshot.cgi?subtype="  + Math.random();
      //            var context = canvas.getContext("2d");
      //            context.drawImage(cImage, 0, 0);

      //        setInterval(function(){
      //            var cImage = new Image;
      //           // cImage.src = "http://10.211.232.5/snapshot.cgi?subtype=" + Math.random();
      //            cImage.src  ="http://10.211.232.5/snapshot.cgi?subtype=";
      //            var context = canvas.getContext("2d");
      //            context.drawImage(cImage, 0, 0);
      //
      //        }, 250);


      // setInterval(function () {
      //   var d = new Date();
      //   //var img = "http://10.211.232.5/snapshot.cgi"+d.getTime()
      //   var img = "http://192.168.1.122/cgi-bin/snapshot.cgi" //+ d.getTime()
      //   //$("#cam").attr("src", img);
      //   // toDataURL(img, function (dataUrl) {
      //   //   // console.log(dataUrl);
      //   //   // $("#cap").attr("src",dataUrl)
      //   //   //get_info(dataUrl);
      //   //   //findCelebrityMatch(dataUrl);
      //   // })
      // }, 10000);



      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({
          video: true
        })
          .then(function (stream) {
            $scope.video.srcObject = stream;
            // video.addEventListener('click', takePicture);
            // $rootScope.takePicInter2 = $interval(takePicture, 3000);
          })
          .catch(function (error) {

            console.log(error);
          });
      }

      $scope.takepicturebuttonfunc = function() {
        console.log("Taking a picture at the CIC.")
        console.log("Current URL: ", new URL(window.location.href).hostname);
       // let scope = angular.element($scope.video).scope();
        document.getElementById("loader").style.display = 'block';
        $scope.takePicture();
      };



      $scope.takePicture = async () => {
        console.log("Taking a picture for analysis.");
        clearTimeout ( $rootScope.refreshTimerId );
        console.log('cleared timeout: ', $rootScope.refreshTimerId)
        $rootScope.refreshTimerId = setTimeout ( $rootScope.resetPage, 60000 );
        console.log('new refresh id: ', $rootScope.refreshTimerId)
        resetCelebrity();
        resetInfo();
        // get video width and height
        var video_width = $scope.video.offsetWidth;
        var video_height = $scope.video.offsetHeight;
        // set canvas and hence the images width and height same as video's
        $scope.canvas = document.createElement('canvas');
        $scope.canvas.width = video_width;
        $scope.canvas.height = video_height;
        var dx = 0; // The X coordinate in the destination canvas at which to place the top-left corner of the source image.
        var dy = 0; // The Y coordinate in the destination canvas at which to place the top-left corner of the source image.
        $scope.canvas.getContext('2d').drawImage($scope.video, dx, dy, $scope.canvas.width, $scope.canvas.height); // cannot find jquery canvas interface so did it in plain js
        $scope.image_base64_global = $scope.canvas.toDataURL("image/jpeg");

        // Call lambda to get asu information and celebrity match
        let response = await $rootScope.getInfo($scope.image_base64_global, ["celebrity_match"]);
        // console.log("Celeb image: ", response["celebrity_match"]["image"])
        // console.log("Celeb name: ", response["celebrity_match"]["name"])
        // console.log("Celeb similarity: ", response["similarity"])
        console.log("Match: ", response["asu_info"]["response"]["docs"])
        console.log(response["asu_info"]["response"]["docs"][0]["displayName"])

        // if (response["celebrity_match"]["image"] && response["celebrity_match"]["name"] && response["similarity"]) {
        if (response["asu_info"]["response"]) {
          console.log('Displaying match')
          // Display celebrity information
          jQuery("img#celebrity").attr("src", response['celebrity_match']['image']);
          jQuery("h3#name").text(response["asu_info"]["response"]["docs"][0]["displayName"]);

          // Display % similarity for the celebrity
          jQuery("#match-bar").text(parseFloat(response["similarity"]).toFixed(2) + "%");

          // const celebrityname = response['celebrity_match']['name'];
          const celebrityname = response["asu_info"]["response"]["docs"][0]["displayName"];
          console.log(celebrityname)
          const likehood = parseFloat(response["similarity"]).toFixed(2);

          var msg = new SpeechSynthesisUtterance();
          var voices = window.speechSynthesis.getVoices();
          //msg.voice = voices[3];
          msg.text ="Cool, you look like,,,"+celebrityname+" and I am "+likehood+" percent sure that's the case";
          speechSynthesis.speak(msg);

          //window.speechSynthesis.speak(new SpeechSynthesisUtterance("Cool, you look like,"+celebrityname+" and I am "+likehood+" percent sure that's the case"));


        }

        // Display emotion emoji
        if(response['emotion']) {
          console.log(`Displaying a ${response['emotion']} emoji`)
          if(response['emotion'] === 'UNKNOWN') {
            console.log('Unknown emotion! OH NO :O')
          }
          jQuery("#emotion_label").show()
          console.log(`img/${response['emotion'].toLowerCase()}.png`)
          jQuery("#emoji").attr("src", `img/${response['emotion'].toLowerCase()}.png`)
          jQuery("#emoji").show()
        }

        // If no asu information was found about the person
        if (jQuery.isEmptyObject(response["asu_info"]) || response["errorMessage"]) {
          resetInfo();
          //resetCelebrity()
          jQuery("#name_of_person").text('');
          console.log("Sorry Could not get ASU/VIP information about you");
          name = "";
          $scope.user_name = "Unknown";
        } else {
          var personData = response["asu_info"]["response"]["docs"][0];

          jQuery("#name_of_person").text(personData["displayName"]);
          jQuery("#title_of_person").text(personData["workingTitle"]);
          jQuery("#department_of_person").text(personData["primaryDepartment"]);

          $scope.user_name = personData["displayName"];

          // Emotion
          if (response["emotion"]) {
            updateById('emotion', response["emotion"].toLowerCase());
          } else {
            updateById('emotion', 'Unknown');
          }

          // Age estimate
          if (response["age_estimate"]) {
            updateById('age_estimate', `${response["age_estimate"].low} - ${response["age_estimate"].high}`);
          } else {
            updateById('age_estimate', '');
          }

          // Gender
          if (response["gender"]) {
            updateById('gender', response["gender"]);
          } else {
            updateById('gender', '');
          }

          // Labels
          if (response["labels"]) {
            var objs = response["object"].slice(response["object"].indexOf(": ") + 2);
            jQuery("#objects_detected").text("Other Objects: " + objs);
          } else {
            jQuery("#objects_detected").text("");
          }
        }
      }


      // Update text by id, or hide if value is null
      function updateById(id, text) {
        if (text) {
          jQuery(`#${id}Label`).show();
          jQuery(`#${id}`).text(text);
        } else {
          jQuery(`#${id}Label`).hide();
          jQuery(`#${id}`).text('');
        }
      }

      function resetCelebrity() {
        jQuery("img#celebrity").attr("src", "img/CIC_Assets-02.png");
        jQuery("#match-bar").text("");
        jQuery("h3#name").text("");
      }

      function resetInfo() {
        jQuery("#name_of_person").text("");
        jQuery("#title_of_person").text("");
        jQuery("#department_of_person").text("");
        jQuery("#emotion_label").hide();
        jQuery('#emoji').hide();
      }



    }])
    .controller('emotionCtrlr', ['$scope', '$rootScope', function ($scope, $rootScope) {
      //setLinkColors.colors('home');
      console.log("Emotion");

      $rootScope.hit_emotions = [];
      var emorunning = false;
      var analyzing = false;

      var target = document.getElementById('celebrity')
      var video = document.getElementById('video');
      var canvas, img_base64;
      var info;
      var previousPersonId = "";
      var data_mqtt_send = "";
      var same = false;
      var celebrityMatched = false;
      var name = "";
      var image_base64_global = '';

      $scope.initImages = function () {
        for (var key in $rootScope.savedEmotions) {
          var simPer = parseFloat($rootScope.savedEmotions[key].amount).toFixed(2);
          jQuery("#" + key + "-bar").css("width", simPer + "%");
          jQuery("#" + key + "-bar").text(simPer + "%");
          jQuery("#" + key + "Img").attr("src", $rootScope.savedEmotions[key].img);
        }
      }

      $scope.takePicture = function () {

        if (!analyzing) {

          analyzing = true;

          var video_width = video.offsetWidth;
          var video_height = video.offsetHeight;

          jQuery("#video").addClass("flashVid").delay(500).queue(function () {
            $(this).removeClass('flashVid').dequeue();
          });

          // set canvas and hence the images width and height same as video's
          canvas = document.createElement('canvas');
          canvas.width = video_width;
          canvas.height = video_height;
          var dx = 0; // The X coordinate in the destination canvas at which to place the top-left corner of the source image.
          var dy = 0; // The Y coordinate in the destination canvas at which to place the top-left corner of the source image.
          canvas.getContext('2d').drawImage(video, dx, dy, canvas.width, canvas.height); // cannot find jquery canvas interface so did it in plain js

          image_base64_global = canvas.toDataURL("image/jpeg");

          if (!emorunning) {
            jQuery("#mydots").removeClass("dotsHide");
          }

          get_info();
        }
        // console.log('Inside Take Picture');
      }

      $scope.auto_run = function () {
        emorunning = !emorunning;
        if (emorunning) {
          jQuery("#runBtn").text("stop");
          $scope.takePicture();
        } else {
          jQuery("#runBtn").text("play_circle_outline")
        }
      }

      var emotes = ["sad", "happy", "calm", "disgusted", "angry", "surprised"];
      $scope.resetgame = function () {
        for (var i = 0; i < emotes.length; ++i) {
          jQuery("#emotion").text("");
          jQuery("#" + emotes[i] + "-bar").css("width", "0%");
          jQuery("#" + emotes[i] + "-bar").text("0.00%");
          jQuery("#" + emotes[i] + "Img").attr("src", "img/CIC_Assets-02.png");
        }

        $rootScope.hit_emotions = [];
        $rootScope.savedEmotions = {
          sad: {
            amount: 0,
            img: "img/CIC_Assets-02.png"
          },
          happy: {
            amount: 0,
            img: "img/CIC_Assets-02.png"
          },
          calm: {
            amount: 0,
            img: "img/CIC_Assets-02.png"
          },
          disgusted: {
            amount: 0,
            img: "img/CIC_Assets-02.png"
          },
          angry: {
            amount: 0,
            img: "img/CIC_Assets-02.png"
          },
          surprised: {
            amount: 0,
            img: "img/CIC_Assets-02.png"
          }
        };
      }

      function get_info() {
        name = "";
        $.ajax({
          type: "POST",
          //url: "https://h2h2c0e7p9.execute-api.us-west-2.amazonaws.com/beta/imageinfo",
          url: "https://0lwnrplnb5.execute-api.us-west-2.amazonaws.com/beta/imageInfoRetriver_new",
          dataType: "json",
          headers: {
            "Content-Type": "application/json"
          },
          //-"x-api-key" : "DAwwV4M2Qh60Fd8lYTA0x7sacLjtKwAn38XJm6in"},
          //"x-api-key" : "h4ANNxg5AA5PpYMxu3QZg7t8C9St6KKI9rZPmrQT"},
          data: JSON.stringify({
            "image": image_base64_global.replace("data:image/jpeg;base64,", "")
          }),
          success: function (data, textStatus, jqXHR) {

            info = data;

            var error_key = "errorMessage";
            if (error_key in info && info["errorMessage"] != "An error occurred (InvalidParameterException) when calling the SearchFacesByImage operation: There are no faces in the image. Should be at least 1.") {
              reset_info();
              name = "";
            } else {

              console.log("Here is the info: ", info);

              var emo = info["emotion"].slice(info["emotion"].indexOf(": ") + 2).toLowerCase(); //ignore stupid label for key

              if ($rootScope.hit_emotions.indexOf(emo) == -1) {
                $rootScope.hit_emotions.push(emo);
              }

              jQuery("#emotion").text($rootScope.hit_emotions);


              var user_name = "Unknown";

              // if (info["info"]) {
              //   user_name = info["info"]["response"]["docs"][0].displayName;
              // }

              var simPer = parseFloat(info["confidence"]).toFixed(2);
              jQuery("#" + emo + "-bar").css("width", simPer + "%");
              jQuery("#" + emo + "-bar").text(simPer + "%");
              jQuery("#" + emo + "Img").attr("src", image_base64_global);
              jQuery("#" + emo + "Img").addClass("flashVid").delay(500).queue(function () {
                $(this).removeClass('flashVid').dequeue();
              });

              $rootScope.savedEmotions[emo] = {
                amount: simPer,
                img: image_base64_global
              };

              $rootScope.compareValues(emo, simPer, image_base64_global, null, user_name);

            }

            analyzing = false;

            if (!emorunning) {
              jQuery("#mydots").addClass("dotsHide");
            }

            if (emorunning) {
              $scope.takePicture();
            }

          },
          error: function (jqXHR, textStatus, errorThrown) {
            analyzing = false;
            if (!emorunning) {
              jQuery("#mydots").removeClass("dotsHide");
            }
            console.log(errorThrown);
          }

        });

        var socket = io.connect('https://52.52.116.33:3000');
        console.log("Socket.io");
        socket.emit('rekognition_data', info);
        socket.on('rekognition_data', function (msg) {
          console.log('Socket client 1 ON');
          // console.log(msg)
          //socket_send.emit('chat message', '#name_of_person');
          socket.emit('chat message', {
            hello: 'world'
          });
        });

      }

      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({
          video: true
        })
          .then(function (stream) {
            video.srcObject = stream;
          })
          .catch(function (error) {

            console.log(error);
          });
      }


    }])
    .controller('hallOfFameCtrlr', ['$scope', '$rootScope', function ($scope, $rootScope) {
      //setLinkColors.colors('home');

      $scope.show = 'Emotions';

      $scope.changeShow = function () {
        if ($scope.show == 'Emotions') {
          $scope.show = 'Celebrity Match'
        } else {
          $scope.show = 'Emotions';
        }
      }

      var h = $rootScope.hallOfFame;
      var hLen = $rootScope.hallOfFame.length;

      for (var key in h) {
        for (var i = 0; i < h[key].length; ++i) {
          jQuery("#" + h[key][i].barId).css("width", h[key][i].amount + "%");
          jQuery("#" + h[key][i].barId).text(h[key][i].amount + "%");
        }
      }


    }])

})();
