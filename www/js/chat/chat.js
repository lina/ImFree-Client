'use strict';

angular.module('ionicApp.chat', [])

.controller('chatCtrl', function($scope, $state, $rootScope) {
  $rootScope.login = false;
  $scope.chats = [{name: "Omar", lastText: "LOL", face: "https://scontent-sjc2-1.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/1604716_10202673663939733_1410194365_n.jpg?oh=5f132a47f63f52e413c62d872c171748&oe=566920ED", id: 123}];

})

.controller('chatDetailCtrl', function($scope, $state, $rootScope, $ionicScrollDelegate, socket, $localStorage, chatServicesSocket, $ionicPopover) {
  // some get req based on the id to get info on that certian chat
  // each chat room has a socket id.... we can use that id itself... bam
  $ionicPopover.fromTemplateUrl('templates/chat/popOverChatSetting.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });


  $rootScope.login = false;

  $scope.InputPlaceholder = [
    'Say Hello!',
    'Be nice :)',
    'Tell them what you want to do!',
    'Be spontaneous???',
    'Just have fun',
    "Don't forget to rate the app!",
    "Be happy, we are!",
    'Smile lots'
  ]

  var generateRandomInputPlaceholder = function(array) {
    var index = Math.floor(Math.random() * array.length);
    $scope.$apply(function() {
      $scope.RandomInputPlaceholder = $scope.InputPlaceholder[index]
    })
  }

  $scope.userData = $localStorage.userData;


  $scope.currentUserId = $scope.userData.fbId;
  $scope.currentUserProfileImage = $scope.userData.pic.data.url;
  $scope.currentUserFirstName = $scope.userData.name.substr(0, $scope.userData.name.indexOf(' '));
  
  console.log('$scope.userData', $scope.userData);
  $scope.receiverUserId = $rootScope.selectedUserToMsg;
  $scope.receiverUserInfo = $rootScope.selectedUserToMsgInfo;
  // $scope.receiverFirstName = $scope.receiverUserInfo.username.substr(0,$scope.receiverUserInfo.username.indexOf(' '));
  console.log('$scope.receiverUserId', $scope.receiverUserId);
  console.log('$scope.receiverUserInfo', $scope.receiverUserInfo);
  $scope.selectedChatId = $rootScope.selectedChatId;

  console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%selectedChatId', $rootScope.selectedChatId);


  $scope.participantUserIDs = {};
  $scope.participantUserIDs[$scope.currentUserId] = Date.now();
  $scope.participantUserIDs[$scope.receiverUserId] = Date.now();

  $scope.participantUserIDsString = '';
  for (var key in $scope.participantUserIDs) {
    $scope.participantUserIDsString += JSON.stringify($scope.participantUserIDs[key]) + '';
  }  


  // $scope.receiverFirstName = $scope.participantUserIDs
  // $scope.receiverUserIDs.push($scope.receiverUserId);

  $scope.addingUserToChat = function(userIDToAdd) {
    // need shittonne of logic here. if currently 2 users, open new chat. if 3 users, persist in current chat

    alert('adding user, userIDToAdd:', userIDToAdd);

    if(!$scope.participantUserIDs[userIDToAdd]) {
      $scope.participantUserIDs[userIDToAdd] = Date.now();
      socket.emit('added new user to chat', 
        $scope.participantUserIDs, 
        $scope.currentUserId, 
        function(data){
        console.log('emitting "adding new user to chat"');
        // $chat.append('<span class="error">' + data + "</span><br/>");
      });      
      
    }
  }

  socket.on('chat participant updates', function(data) {
    console.log('socket.on "chat participant updates"');

    $scope.participantUserIDs = data;

    for (var key in $scope.participantUserIDs) {
      $scope.participantUserIDsString += JSON.stringify($scope.participantUserIDs[key]) + '';
    }  


  })

  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!$scope.selectedChatId', $scope.selectedChatId);
  // ajax request here
  // ajax response here 
  var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
  // $scope.user = {_id: 123};
  // $scope.chatMsgs = 
  //   [{text: 'hi', userId: $scope.receiverUserId, firstName: $scope.receiverFirstName, timestamp_created: 1442248009876, profileImage: $scope.receiverUserInfo.profilePic}, 
  //   {text: 'hi', userId: $scope.userData.fbId, firstName: $scope.currentUserFirstName,timestamp_created: 1442248061232, profileImage: $scope.userData.pic.data.url }, 
  //   {text: 'hi', userId: $scope.receiverUserId, firstName: $scope.receiverFirstName, timestamp_created: 1442248075389, profileImage: $scope.receiverUserInfo.profilePic}, 
  //   {text: 'hi', userId: $scope.userData.fbId, firstName: $scope.currentUserFirstName, timestamp_created: 1442248085159, profileImage: $scope.userData.pic.data.url }];

  $scope.chatMsgs = [];

  // $scope.authorData = $localStorage.userData;
  // $scope.

  // $scope.toUser = {username:"Nate", pic: "https://scontent-sjc2-1.xx.fbcdn.net/hphotos-xpa1/v/t1.0-9/1604716_10202673663939733_1410194365_n.jpg?oh=5f132a47f63f52e413c62d872c171748&oe=566920ED"};
  // $scope.fromUser = {username:"Omar", pic: "https://scontent-sjc2-1.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/10417801_10205603744989928_8706339890647288713_n.jpg?oh=d055bbd53c3fec5dc75f8b151600bd6c&oe=56727532"};

  socket.on('receive new message', function(data){

    $scope.chatMsgs.push({text: data.message, firstName: data.senderFirstName, userId: data.senderId, timestamp_created: data.messageTime, profileImage: data.senderProfileImage});

    // $chat.append('<span class="msg"><b>' + data.nick + ': </b>' + data.msg + "</span><br/>");
  });


  $scope.submitText = function(text){
    // socket.emit('send message', text, toUser.userId);


    $scope.messageData = {
      message: text,
      messageTime: Date.now(),
      senderId: $scope.currentUserId,
      senderProfileImage: $scope.currentUserProfileImage,
      senderFirstName: $scope.currentUserFirstName,
      conversationId: $scope.selectedChatId
    }
    console.log('$scope.messageData',$scope.messageData);
    // depending on if the chat exists in userChat's allchat's array,  
      // if it does, simply do post request to send message
      // if it doesn't, do a post request to create a new database AND send message. (I think);


    //chuck this in an array

    // for (var key in participantUserIDs) {
    socket.emit('send message', 
        $scope.messageData, 
        $scope.participantUserIDs, 
        // $scope.currentUserId,
        function(data) {
      console.log('emitting "send message"');
      // $chat.append('<span class="error">' + data + "</span><br/>");
    });      
    // }


    chatServicesSocket.emit('write message to db', $scope.messageData, function(data) {
      console.log("chatServicesSocket.emit('write message to db')");
    })


    // $scope.chatMsgs.push({text: text, userId: 123, time: new Date()});
    $scope.chatMsgs.push({text: text, firstName: $scope.currentUserFirstName, userId: $scope.currentUserId, timestamp_created: Date.now()});

    $scope.input.message = "";
    viewScroll.resize();
    viewScroll.scrollBottom();
  }

  $scope.redirectToChats = function() {
    $state.go('chat');
  }
})

// add extra line at end
