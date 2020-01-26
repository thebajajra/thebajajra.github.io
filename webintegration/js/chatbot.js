    let app ={
    appURL:'https://bot.bankbuddy.ai/webchat',
    chatIcon : 'logos/logo.png',
    chatLogo : 'logos/last_logo.png',
    appHead : 'FirstCapital Buddy',
    appDesc : 'Your Banking Assistant',
    apphideHead : '.b-agent-demo_header',
    }
    // '#104b7d',
let themeColor ={
    HeaderbgColor : '#112369',
    chatBg : '#fff',
    borderColor:'1px solid #cecece'
}
//icon => i
//Header => h
//extra info =>e
function chatBox(_item,_theme){
    this._item = _item;
    this._theme = _theme;
}
function chatToggle(_this,chatDiv){
    $(_this).hide();
    $(chatDiv).show();
}
chatBox.prototype.createDom = function(){
  let styleTag = document.createElement('style');
  let div = document.createElement("div");
  let main_div = $(div).attr('id','ico');
  let _img = document.createElement('img');
  _img.setAttribute('src',this._item.chatIcon);
  $('body').append(main_div);
  $('head').append('<link href="css/style.css" rel="stylesheet" type="text/css" />');
  $(main_div).append(_img);
  $('body').append('<div id="main-chat-wrapper" style="background:'+ this._theme.chatBg +';border:'+this._theme.borderColor+';"></div>');
  $('#main-chat-wrapper').append('<header class="chat-header" style="background:'+ this._theme.HeaderbgColor +';color:'+this._theme.chatBg+'"></header>');
  $('.chat-header').append('<div class="header-wrapper"><a class="logo"><img src="'+this._item.chatLogo+'" /></a></div><div class="header-wrapper"><h3>'+ this._item.appHead +'</h3><p>'+this._item.appDesc+'</p><a class="close"><i class="fa fa-times"></i></a></div>');
let  url = this._item.appURL;

$('#main-chat-wrapper').find('iframe').remove();
         $('#main-chat-wrapper').append('<iframe id="content" src="'+url+'"></iframe>');
         $('#content').removeAttr('src');

    $('#ico').click(function(){
        chatToggle($(this),'#main-chat-wrapper');
        /*if($('#main-chat-wrapper').find('iframe')){
                 }*/

       /*setTimeout(function(){
        let iframe = document.getElementById('content');
         let ele = iframe.contentWindow.document.getElementsByClassName('b-agent-demo_header')[0];
         ele.style.display = 'none';
       },1000)*/
    });
    $("#content").contents().find(".b-agent-demo_header").remove();
    $('.close').click(function(){
        chatToggle('#main-chat-wrapper','#ico');
    });
}

let demo = new chatBox(app,themeColor);

demo.createDom();
