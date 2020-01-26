/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
    "use strict";
    var doc_data = new FormData();
    var ENTER_KEY_CODE = 13;
    var MOUSE_CLICK_CODE = 1;
    var textAlignment = 'right';
    var counter = 0; //FOR STEP BY STEP DOCUMENT UPLOAD
    var queryInput, resultDiv, clickSubmit, resultWrapperDiv, accessTokenInput = "38772fe1c44b4cb7aadc94f38bc129eb";
    var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    var recorder; // globally accessible
    var microphone;
    var btnStartRecording = document.getElementById('trigger');
    $(document).on("change", "#i", function() {
            counter = counter + 1;
            console.log('COUNTER: ', counter);
            var file_data = $("#i").prop("files")[0];   // Getting the properties of file from file field
            var form_data = new FormData();                  // Creating object of FormData class
            form_data.append("file", file_data);              // Appending parameter named file with properties of file_field to form_data
            form_data.append("user_id", 123);                 // Adding extra parameters to form_data
            $.ajax({
                    url: "https://fcb-mwi.bankbuddy.ai/ocr",
                    data: form_data,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    success: function (data) {
                        console.log(data);
                        var responseNode = createResponseNode();
                        setResponseOnNode(data, responseNode);
                        resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;
                        // jQuery('#attachbtn').css('display', 'none');
                          var resnode = createResponseNode();
                          if(counter == 2){
                            //Vehicle Registration Card
                            // jQuery('#attachbtn').css('display', 'block');
                            // var d2 = {'data': [{'title': 'Document Upload', 'subtitle': 'Almost there...! Please upload a scanned copy of your Vehicle Registration Card'}]}
                            // var R2 = createResponseNode();
                            // setResponseOnNode(d2, R2);
                            doc_data.append('doc2', file_data);
                            jQuery.ajax({
                                "url": "https://api.bankbuddy.me/bbvision/docverify/",
                                "method": "POST",
                                "data": doc_data,
                                "processData": false,
                                "contentType": false,
                                "success": function (res) {
                                    console.log(res);
                                    jQuery('#attachbtn').css('display', 'none');
                                    counter = 0;
                                    console.log('COUNTER: ', counter);
                                    if(res.message == 'ERROR'){
                                        var d3 = {'data': [{'title': 'eKYC result recieved', 'subtitle': 'Sorry, the document verification for KYC failed. Please make sure to upload valid documents'}]}
                                        var R3 = createResponseNode();
                                        setResponseOnNode(d3, R3);
                                    }else{
                                        var d3 = {'data': [{'title': 'Document Upload', 'subtitle': 'Yay! your documents have been verified, please authenticate yourself to complete KYC updation '}]}
                                        var R3 = createResponseNode();
                                        setResponseOnNode(d3, R3);
                                        window.open("https://exchange.bankbuddy.ai/zoe/auth/authselect", "_blank", "toolbar=yes,top=200,left=1400,width=500,height=600");}}, "error": function (error) {console.log(error);
                                }
                            });
                          }else {
                              sendText('quote').then(function (response) {
                                  var result = response;
                                  setResponseOnNode(result, resnode);
                                  if (counter == 1) {
                                      //Driving License
                                      // jQuery('#attachbtn').css('display', 'block');
                                      doc_data.append('doc1', file_data);
                                      var d1 = {
                                          'data': [{
                                              'title': 'Document Upload',
                                              'subtitle': 'Great! Now upload a scanned copy of your Emirates ID'
                                          }]
                                      }
                                      var R1 = createResponseNode();
                                      setResponseOnNode(d1, R1);
                                      // }else
                                  } else if (counter == 3) {
                                      jQuery('#attachbtn').css('display', 'none');
                                      counter = 0;
                                      var paynode = createResponseNode();
                                      sendText('payment').then(function (response) {
                                          setResponseOnNode(response, paynode);
                                      }).catch(function (err) {
                                          /*setResponseJSON(err);*/
                                          setResponseOnNode("Unable to process that. Can you check network connection and try again?", resnode);
                                      });
                                  }
                              }).catch(function (err) {
                                  /*setResponseJSON(err);*/
                                  setResponseOnNode("Unable to process that. Can you check network connection and try again?", resnode);
                              });
                          }
                    }
               });
        });

    window.onload = init;

    function init() {
        queryInput = document.getElementById("q");
        resultDiv = document.getElementById("result");
        resultWrapperDiv = document.getElementById("resultWrapper");

        /*accessTokenInput = document.getElementById("access_token");*/

        queryInput.addEventListener("keydown", queryInputKeyDown);

        clickSubmit = document.getElementById("submit_btn");
        clickSubmit.addEventListener("click", queryInputKeyDown);
        /*var setAccessTokenButton = document.getElementById("set_access_token");
        setAccessTokenButton.addEventListener("click", setAccessToken);*/
        document.getElementById("placeholder").style.display = "none";
        document.getElementById("main-wrapper").style.display = "block";
        setAccessToken();
    }

    function setAccessToken() {
        document.getElementById("placeholder").style.display = "none";
        document.getElementById("main-wrapper").style.display = "block";
        window.init("38772fe1c44b4cb7aadc94f38bc129eb");
    }

    function captureMicrophone(callback) {
        // btnReleaseMicrophone.disabled = false;
        if(microphone) {
            callback(microphone);
            return;
        }
        if(typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
            alert('This browser does not supports WebRTC getUserMedia API.');
            if(!!navigator.getUserMedia) {
                alert('This browser seems supporting deprecated getUserMedia API.');
            }
        }
        navigator.mediaDevices.getUserMedia({
            audio: isEdge ? true : {
                echoCancellation: false
            }
        }).then(function(mic) {
            callback(mic);
        }).catch(function(error) {
            alert('Unable to capture your microphone. Please check console logs.');
            console.error(error);
        });
    };

    function releaseMicrophone(){
        if(microphone) {
            microphone.stop();
            microphone = null;
        }
    };

    btnStartRecording.onclick = function() {
        this.disabled = true;
        this.style.border = '';
        this.style.fontSize = '';
        if (!microphone) {
            captureMicrophone(function(mic) {
                microphone = mic;
                if(isSafari) {
                    // replaceAudio();
                    // audio.muted = true;
                    // audio.srcObject = microphone;
                    btnStartRecording.disabled = false;
                    btnStartRecording.style.border = '1px solid red';
                    btnStartRecording.style.fontSize = '150%';
                    alert('Please click startRecording button again. First time we tried to access your microphone. Now we will record it.');
                    return;
                }
                click(btnStartRecording);
            });
            return;
        }
        // replaceAudio();
        // audio.muted = true;
        // audio.srcObject = microphone;
        var options = {
            type: 'audio',
            numberOfAudioChannels: isEdge ? 1 : 2,
            checkForInactiveTracks: true,
            bufferSize: 16384
        };
        if(isSafari || isEdge) {
            options.recorderType = StereoAudioRecorder;
        }
        if(navigator.platform && navigator.platform.toString().toLowerCase().indexOf('win') === -1) {
            options.sampleRate = 48000; // or 44100 or remove this line for default
        }
        if(isSafari) {
            options.sampleRate = 44100;
            options.bufferSize = 4096;
            options.numberOfAudioChannels = 2;
        }
        if(recorder) {
            recorder.destroy();
            recorder = null;
        }
        recorder = RecordRTC(microphone, options);

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioContext = new AudioContext();
        function startUserMedia(stream) {
	    // Create MediaStreamAudioSourceNode
	    var source = audioContext.createMediaStreamSource(stream);

	    // Setup options
	    var options = {
	     source: source,
	     voice_stop: function() {
			console.log('voice_stop');
			send();
			},
	     voice_start: function() {console.log('voice_start');}
	    };

	    // Create VAD
	    var vad = new VAD(options);
	  }

	  // Ask for audio device
	  navigator.getUserMedia = navigator.getUserMedia ||
	                           navigator.mozGetUserMedia ||
	                           navigator.webkitGetUserMedia;
	  navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
          console.log("No live audio input in this browser: " + e);
  });



        recorder.startRecording();


            function send() {
                    //this.disabled = true;
                    btnStartRecording.disabled = false;
                    if(isSafari) {
                        releaseMicrophone();
                       }
                    recorder.stopRecording(function(){
                        var blob = this.getBlob();
                        var file = new File([blob], getFileName('mp3'), {
                        type: 'audio/mp3'
                        });
                        var formData = new FormData();
                        formData.append('file', file);
                        $.ajax({
                            url: "https://sensei.bankbuddy.ai/speechapi/en/",
                            data: formData,
                            processData: false,
                            contentType: false,
                            type: 'POST',
                            success: function (data) {
                                console.log(data.transcript);
                                var k = data.transcript
                                sendText(k).then(function(response) {
				                console.log(response);
                                var responseNode = createResponseNode();
                                setResponseOnNode(response, responseNode);
                                resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;
      	                 	});
                            }
                        });
                    });
                }

    };

    function click(el) {
        el.disabled = false; // make sure that element is not disabled
        var evt = document.createEvent('Event');
        evt.initEvent('click', true, true);
        el.dispatchEvent(evt);
    };

    function getRandomString() {
        if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
                token = '';
            for (var i = 0, l = a.length; i < l; i++) {
                token += a[i].toString(36);
            }
            return token;
        } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
    };

    function getFileName(fileExtension) {
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var date = d.getDate();
        return 'RecordRTC-' + year + month + date + '-' + getRandomString() + '.' + fileExtension;
    };


    function addUserInput(value) {
        resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;

        //if(value)
            createQueryNode(value);
        var responseNode = createResponseNode();

        sendText(value)
            .then(function(response) {
                var result;
                try {
                    result = response;
                    /*.result.fulfillment.speech*/
                } catch (error) {
                    result = "";
                }
                /*setResponseJSON(response);*/
                setResponseOnNode(result, responseNode);
            })
            .catch(function(err) {
                /*setResponseJSON(err);*/
                setResponseOnNode("Unable to process that. Can you check network connection and try again?", responseNode);
            });
    }

    function addUrlInput(value) {
        window.open(value, '_blank');
    }

    function addPhoneInput(value) {
        window.open('tel:' + value);
    }

    function showLoginInput(lblusr, lblpwd, lblsubmit) {
        resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;

        var useridNode = document.createElement('input');
        var pwdNode = document.createElement('input');
        useridNode.setAttribute('type', 'text');
        pwdNode.setAttribute('type', 'password');

        if(typeof lblusr == "undefined" || lblusr ==null) lblusr = "Provide your User Id"
        if(typeof lblpwd == "undefined" || lblpwd ==null) lblpwd = "Provide your Password"

        useridNode.setAttribute('placeholder', lblusr);
        pwdNode.setAttribute('placeholder', lblpwd);

        var buttonnode = document.createElement('input');
        buttonnode.setAttribute('type', 'button');
        buttonnode.className += 'btns';
        buttonnode.setAttribute('value', lblsubmit);

        var node = createLoginNode();
        node.appendChild(useridNode);
        node.appendChild(pwdNode);
        node.appendChild(buttonnode);

        buttonnode.addEventListener('click', function() {
            if(useridNode.value == null || useridNode.value == "") alert("Please provide your User Id");
            else if(pwdNode.value == null || pwdNode.value == "") alert("Please provide your Password");
            else{
                var eventData = { "userid": useridNode.value, "pwd": pwdNode.value};
                sendLoginInput(node, eventData);
            }
        });

        resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;
    }

    function showInputForm(arrFields, strIntent, lblsubmit="Submit") { //btnJson.title, btnJson.fields, btnJson.intent, btnJson.lblsubmit
        resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;
        var node = createInputFormNode();

        var arrInputFields = [];
        for(var x = 0; x< arrFields.length; x++){
            arrInputFields[x] = document.createElement('input');
            arrInputFields[x].setAttribute('id', Object.keys(arrFields[x])[0])
            arrInputFields[x].setAttribute('type', Object.values(arrFields[x])[0]['type']);
            arrInputFields[x].setAttribute('placeholder', Object.values(arrFields[x])[0]['placeholder']);
            if (Object.values(arrFields[x])[0]['type'] == 'date'){
               arrInputFields[x].setAttribute('onfocus', "(this.type='date')");
               arrInputFields[x].setAttribute('onblur', "(this.type='text')");
               arrInputFields[x].setAttribute('type', 'text');
            }
            node.appendChild(arrInputFields[x]);
        }


        var buttonnode = document.createElement('input');
        buttonnode.setAttribute('type', 'button');
        buttonnode.className += 'btns';
        buttonnode.setAttribute('value', lblsubmit);
        node.appendChild(buttonnode);

        buttonnode.addEventListener('click', function(){
            var eventData = {}
            var x = 0;
            for(; x< arrFields.length; x++) {
                if(arrInputFields[x].value == null || arrInputFields[x].value == ""){
                    alert(arrInputFields[x].placeholder + ' should not be empty');
                    break;
                } else {
                    eventData[arrInputFields[x].id] = arrInputFields[x].value
                }
            }
            if(x == arrFields.length) sendFormInput(node, eventData, strIntent);
        });

        resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;
    }

    function sendLoginInput(responseNode, value){
        sendEvent("actions.intent.LOGIN", value)
            .then(function(response) {
                var result;
                try {
                    result = response
                    /*.result.fulfillment.speech*/
                } catch (error) {
                    result = "";
                }
                /*setResponseJSON(response);*/
                setResponseOnNode(result, responseNode);
            })
            .catch(function(err) {
                /*setResponseJSON(err);*/
                setResponseOnNode("Unable to process that. Can you check network connection and try again?", responseNode);
            });
    }

    function sendFormInput(responseNode, value, strIntent){
        sendEvent(strIntent, value)
            .then(function(response) {
                var result;
                try {
                    result = response
                    /*.result.fulfillment.speech*/
                } catch (error) {
                    result = "";
                }
                /*setResponseJSON(response);*/
                setResponseOnNode(result, responseNode);
            })
            .catch(function(err) {
                /*setResponseJSON(err);*/
                setResponseOnNode("Unable to process that. Can you check network connection and try again?", responseNode);
            });
    }



    function queryInputKeyDown(event) {
        if (event.which !== ENTER_KEY_CODE && event.which !== MOUSE_CLICK_CODE) {
            return;
        }
        var value = queryInput.value;
        if (!value || value.trim().length ==0 ) {
            return;
        }

        queryInput.value = "";
        resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;

        createQueryNode(value);
        var responseNode = createResponseNode();



        sendText(value)
            .then(function(response) {
                var result;
                try {
                    result = response /*.result.fulfillment.speech*/
                } catch (error) {
                    result = "";
                }
                /*setResponseJSON(response);*/
                setResponseOnNode(result, responseNode);
            })
            .catch(function(err) {
                /*setResponseJSON(err);*/
                setResponseOnNode("Unable to process that. Can I connect you to a human?", responseNode);
            });
    }

    function createQueryNode(query) {
        var parentNode = document.createElement('div');
        var node = document.createElement('div');
        node.className = "clearfix left-align window__chatVisitorMessage text-darken-2";
        node.innerHTML = query;

        if (textAlignment === 'right') {
            parentNode.className = 'clearfix right-align card-panel queryParent hoverable';
            parentNode.appendChild(node);
            // parentNode.appendChild(userAvatar);
            resultDiv.appendChild(parentNode);

        } else {
            parentNode.className = 'clearfix left-align card-panel queryParent hoverable';
            // parentNode.appendChild(userAvatar);
            parentNode.appendChild(node);
            resultDiv.appendChild(parentNode);
        }

        // resultDiv.appendChild(node);
        resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;
    }

    function createResponseNode() {
        var parentNode = document.createElement('div');
        var node = document.createElement('div')
        //node.className = "clearfix left-align right window__chatServerMessage text-darken-2";
        //node.className = "clearfix left-align card-panel black-text text-darken-2 hoverable";
        // var botAvatar = document.createElement('div');
        // botAvatar.className = 'botAvatar';
        // var img = document.createElement('img');
        // img.src='./imddafges/webchat_bot.png';


        if (textAlignment === 'right') {
            parentNode.className = 'clearfix left-align left responseParent';
            // botAvatar.appendChild(img);
            // parentNode.appendChild(botAvatar);
            parentNode.appendChild(node);
        } else {
            parentNode.className = 'clearfix right-align';
            // botAvatar.appendChild(img);
            parentNode.appendChild(node);
            // parentNode.appendChild(botAvatar);
        }


        node.innerHTML = "...";
        resultDiv.appendChild(parentNode);
        resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;
        return node;
    }

    function createLoginNode() {
        var node = createResponseNode()//document.createElement('div')
        //node.className = "clearfix left-align right card-panel black-text text-darken-2 hoverable";
        node.innerHTML = '';
        //resultDiv.appendChild(node);

        return node;
    }

    function createInputFormNode() {
        var node = createResponseNode()//document.createElement('div')
        //node.className = "clearfix left-align right card-panel black-text text-darken-2 hoverable";
        node.innerHTML = '';
        //resultDiv.appendChild(node);

        return node;
    }

    function setResponseOnNode(response, node) {
        //node.innerHTML = response ? response.join("</button> <br/> <button class='btns' onclick='msgButtonClick(this)'>") : "[empty response]";
        //response = { "recipient_id": "default", "data": [{ "buttons": [{ "payload": "Which education loan do you offer", "title": "Education Loan" }, { "payload": "Which home loan do you offer", "title": "Home Loan" }, { "payload": "Which vehicle loan do you offer", "title": "Car Loan" }], "image_url": "http://shoal.cloud/wp-content/uploads/2016/12/bank-relations-management-solutions-700x455.jpg", "subtitle": "Find the right loan", "card": null, "title": "Hey! I'm BankBuddy loans chatbot." }, { "buttons": [{ "payload": "Which SME loan do you offer", "title": "SME Loan" }, { "payload": "Which consumer durable loan do you offer", "title": "Cons. Durable Loan" }, { "payload": "Which personal loan do you offer", "title": "Personal Loan" }], "image_url": "http://bankbuddy.ai/wp-content/uploads/2018/02/pexels-photo-91985-medium.jpeg", "subtitle": "Find the right loan", "card": null, "title": "Hey! I'm BankBuddy loans chatbot." }] }

        if (response) {
            console.log('RESPONSE', response);
            // console.log(response['data'][0]['title']); --> DEBUG

            node.className = "clearfix left-align card-panel black-text text-darken-2 hoverable";
                //node.className = "clearfix left-align window__chatServerMessage text-darken-2 hoverable";
            try {
                if (typeof response == 'object' && typeof response.data != "undefined") {

                    var finaldiv = document.createElement('div');

                    if (response.data.length > 1) {
                        if(response['data'][0]['intent'] == 'quote'){
                            if(counter == 0){
                                //Emirates ID
                                jQuery('#attachbtn').css('display', 'block');
                                var data = {'data': [{'title': 'Document Upload', 'subtitle': 'I understand you want to get your KYC done. Please upload a scanned copy of your Driving Licence by clicking on the attach button below.'}]};
                                var R = createResponseNode();
                                setResponseOnNode(data, R);
                            }
                        }
                        addCrsl(response.data, finaldiv);
                        node.innerHTML = '';
                        node.appendChild(finaldiv);
                    } else if (response.data.length == 1) {
                        if(response['data'][0]['intent'] == 'quote'){
                            if(counter == 0){
                                //Emirates ID
                                jQuery('#attachbtn').css('display', 'block');
                                var data = {'data': [{'title': 'Document Upload', 'subtitle': 'I understand you want to get quote for your eKYC verification. Please upload a scanned copy of your Driving Licence by clicking on the attach button below.'}]};
                                var R = createResponseNode();
                                setResponseOnNode(data, R);
                            }
                        }
                        addCard(response.data[0], finaldiv);
                        node.innerHTML = '';
                    } else {
                    }

                    node.appendChild(finaldiv);

                } else if (typeof response.text != "undefined"){
                    node.innerHTML = "<br/>";
                    var textNode = document.createTextNode(response.text);
                    node.appendChild(textNode);
                    node.innerHTML += "<br/>"
                } else node.innerHTML = "Unable to get response from server. Please try again later.";
            } catch (e) {
                node.innerHTML = '';
                node.innerHTML = response;
            }
        } else node.innerHTML = "Unable to connect";

        node.setAttribute('data-actual-response', response);

        resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;
    }

    function addCrsl(data, node) { //data
        var crslnode = document.createElement('div');
        crslnode.className = 'slide-container hoverable clearfix'

        setTimeout(function() {
            var slider = $(".slide-container").not('.slick-initialized').slick({
                infinite: false,
                slidesToShow: 1,
                slidesToScroll: 1,
                prevArrow: '<button type="button" class="slick-prev fa fa-angle-left"></button>',
                nextArrow: '<button type="button" class="slick-next fa fa-angle-right"></button>',
            });

            $('.next').click(function() {
                $('.slide-container').slick('slickNext');
            });

            $('.previous').click(function() {
                $('.slide-container').slick('slickPrev');
            });

            $('.slide-container').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
                if (nextSlide == slick.slideCount - 1) {
                    $('.next').hide();
                    $('.previous').show();
                } else if (nextSlide != slick.slideCount - 1 && nextSlide != 0) {
                    $('.next').show();
                    $('.previous').show();
                } else if (currentSlide == 0 || nextSlide == 0) {
                    $('.next').show();
                    $('.previous').hide();
                }
            });

        }, 100);
        for (var i = 0; i < data.length; i++) {
            addCard(data[i], crslnode); //data[i]
        }
        node.appendChild(crslnode);
    }

    function addCard(datum, node) { //card
        var divnode = document.createElement('div');
        divnode.className += 'carrousel new accent-4';

        if (typeof datum.image_url != 'undefined' && datum.image_url != null) { //card.image_url
            addImage(datum.image_url, divnode); //card.image_url
        }
        if(typeof datum.title != 'undefined'){
            var cardTitle = document.createElement("span");
            cardTitle.className = "card-title";
            cardTitle.innerHTML = datum.title;
            divnode.appendChild(cardTitle);

            if(typeof datum.subtitle != 'undefined'){
              var cardSubTitle = document.createElement("span");
              cardSubTitle.className = "card-subtitle";
              cardSubTitle.innerHTML =  datum.subtitle;
              divnode.appendChild(cardSubTitle);
            }

            /*var textNode = document.createTextNode( (typeof datum.subtitle != 'undefined')? datum.title + " : " + datum.subtitle  : datum.title );
            divnode.appendChild(textNode);*/
        }

        removeSuggestions()
        if (typeof datum.buttons != 'undefined') {
            renderSuggestions(datum.buttons)
            //for (var x = 0; x < datum.buttons.length; x++) {
            //    addBtn(datum.buttons[x], divnode); // card.buttons
            //}
        }
        node.appendChild(divnode);
    }

    function addImage(str, node) {
        var imgNode = document.createElement('img');
        imgNode.class += 'cardimage';
        imgNode.setAttribute('src', str);
        node.appendChild(imgNode);
    }

    function addBtn(btnJson, node) {
      var buttonnode= document.createElement('input');
      buttonnode.setAttribute('type','button');
      buttonnode.setAttribute("onkeydown","if(event.which || event.keyCode){if (event.keyCode == 13) return false;}");
      buttonnode.className += 'sgstnbtns';
      buttonnode.setAttribute('value', btnJson.title);
      node.appendChild(buttonnode);

      if(btnJson.type && btnJson.type == "web_url"){
        buttonnode.addEventListener('click', function() {
        addUrlInput(btnJson.url);
        });
      } else if (btnJson.type && btnJson.type == "phone_number") {
        buttonnode.addEventListener('click', function() {
        addPhoneInput(btnJson.payload);
        });
      } else if (btnJson.type && btnJson.type == "account_link") {
        if(typeof btnJson.url == "undefined"){
            buttonnode.addEventListener('click', function() {
            showLoginInput(btnJson.lblusr, btnJson.lblpwd, btnJson.lblsubmit);
            });
        } else{
            addUrlInput(btnJson.url);
        }
       } else if (btnJson.type && btnJson.type == "input_form") {
        if(typeof btnJson.url == "undefined"){
            buttonnode.addEventListener('click', function() {
            showInputForm(btnJson.fields, btnJson.intent, btnJson.lblsubmit);
            });
        } else{
            addUrlInput(btnJson.url);
        }
       } else if (btnJson.payload){
                buttonnode.addEventListener('click', function(){addUserInput(btnJson.payload);});
       }

        /*} else {
            node.innerHTML += "<br/>";
              var textNode = document.createTextNode(str);
              node.appendChild(textNode);
            node.innerHTML += "<br/>";
              return;
        }*/
    }

    function setResponseJSON(response) {
        var node = document.getElementById("jsonResponse");
        node.innerHTML = JSON.stringify(response, null, "/n");
    }

    function sendRequest() {

    }
    function renderSuggestions(buttons) {
            var allSelects = document.getElementsByClassName("responseParent");
            var lastSelect = allSelects[allSelects.length - 1];
            var sgNode = document.createElement('div');
            sgNode.className = 'clearfix sgNode';
            addSuggestions(buttons, sgNode);
            $(sgNode).insertAfter(lastSelect);
            sgNode.setAttribute("onload", test());


    }


    function test() {
        // $(".sgNode").css({
        //   'width': ($(".responseParent").width() + 'px')
        // });
        setTimeout(function() {
            resultWrapperDiv.scrollTop = resultWrapperDiv.scrollHeight;
        }, 200);
    }



    function removeSuggestions() {
                if (document.getElementsByClassName("sgNode")[0]) {
                document.getElementsByClassName("sgNode")[0].remove();
            }
    }

    function addSuggestions(buttons, node) {
        if (buttons.length > 2) {
            node.classList.add("h");
            setTimeout(function() {
                var slider = $(".sgNode").not('.slick-initialized').slick({
                    infinite: false,
                    draggable: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    variableWidth: true,
                    mobileFirst: true,
                    prevArrow: '<button type="button" class="slick-prev fa fa-angle-left fa"></button>',
                    nextArrow: '<button type="button" class="slick-next fa fa-angle-right fa"></button>',

                });
                node.classList.remove("h");

            }, 200);
        }
        for (var i = 0; i < buttons.length; i++) {
            addBtn(buttons[i], node);
        }
    }




})();


