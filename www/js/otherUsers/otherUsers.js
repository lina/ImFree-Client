'use strict';

angular.module('ionicApp.otherUsers', [])

.controller('otherUsersCtrl', function($scope, $state, $rootScope, $cordovaGeolocation, $http, $localStorage, $location, socket, chatServicesSocket) {
  console.log($localStorage.userData);

  var loadNearbyUsers = function(){
    if ($localStorage.userData){
      $cordovaGeolocation
        .getCurrentPosition({timeout: 5000, enableHighAccuracy: false})
        .then(function (position) {
          var lat  = position.coords.latitude
          var long = position.coords.longitude
          console.log("lat", lat);
          console.log("long", long);
          $http.post($rootScope.mobileFacadeURL + '/api/checkin/getcheckin?latitude=' + lat + '&longitude=' + long + '&distance=' +  $rootScope.distance + '&currentFbId=' + $localStorage.userData.fbId, {access_token: $localStorage.access_token})
            .then(function(resp){
              console.log(resp.data);

              $rootScope.userResults = resp.data;

              console.log('1-->$rootScope.userResults', $rootScope.userResults);

              for (var i = 0 ; i < $rootScope.userResults.length; i++) {
                $rootScope.userResults[i].distanceMiles = $rootScope.userResults[i].distanceMiles || '<1';
                var firstNameOnly = $rootScope.userResults[i].username.slice(0, $rootScope.userResults[i].username.indexOf(' '));
                $rootScope.userResults[i].username = firstNameOnly;
              }
              console.log('2--> $rootScope.userResults', $rootScope.userResults);
            })
          });
    }
  };


  loadNearbyUsers();
  $rootScope.login = false;
  $rootScope.isPrivateChat = false;
  
  $scope.storedMessages = $rootScope.storedMessages;

  $scope.sendMessage = function(userId, userInfo) {
    // $scope.$apply(function() {
    $rootScope.participantUserIDs = {};
    // $rootScope.isPrivateMessage = userId;
    $scope.currentTime = Date.now();
    // $rootScope.
    // })
    $rootScope.isPrivateChat = true;

    console.log('userId in sendMessage', userId);
    if(userId) {
      console.log('$localStorage.userDataChats', $localStorage.userDataChats);

      // var userDataPrivateChats = $localStorage.userDataChats.chatId_private;
      

      console.log('inside userId if function')
      $rootScope.currentUserId = $localStorage.userData.fbId;
      var currentUserIdVar = $rootScope.currentUserId;
      console.log('currentUserIdVar', currentUserIdVar);
      $rootScope.selectedUserToMsg = userId;
      $rootScope.selectedUserToMsgInfo = userInfo;
      console.log('$rootScope.selectedUserToMsgInfo:', $rootScope.selectedUserToMsgInfo);

      // checks if the userId matches up with anything in the userChats object. if it doesn't, go straight to chat. if it does, pull up existing chat (get request to database). 

      // if($localStorage.userPrivateChats[userId]) {
      //   $rootScope.selectedChatId = $localStorage.userPrivateChats[userId];
      // } else {
      //   $localStorage.userPrivateChats[userId] = 
      // }

      $rootScope.selectedChatId =  $localStorage.userPrivateChats[userId] || currentUserIdVar.concat($scope.currentTime);


      //check if this is working. 
      console.log('about to emit socket "update other user private chat storage"')
      console.log('userId:', userId);
      console.log('$rootScope.selectedChatId:', $rootScope.selectedChatId);
      console.log('$localStorage.userData.fbId:', $localStorage.userData.fbId);
      socket.emit('update other user private chat storage', userId, $rootScope.selectedChatId, $localStorage.userData.fbId, function(data) {
        console.log("socket.emit 'update other user private chat storage'")

        console.log('data:', data);
      });

      // create a conversation in database. even though it's empty.
      var tempParticipantsArray = [];
      tempParticipantsArray.push($rootScope.currentUserId);
      tempParticipantsArray.push($rootScope.selectedUserToMsg);

      $scope.createNewConversationInDatabase($rootScope.selectedChatId, $localStorage.userData.fbId,$scope.currentTime,tempParticipantsArray,false)

      if(!$localStorage.userPrivateChats[userId]) {
        $localStorage.userPrivateChats[userId] = $rootScope.selectedChatId;
      }

      if(!$localStorage.userAllChatsObject[$rootScope.selectedChatId]) {
        $localStorage.userAllChatsObject[$rootScope.selectedChatId] = true;
        $localStorage.userAllChatsArray.push($rootScope.selectedChatId);
      }
      console.log('$rootScope.selectedUserToMsg:', $rootScope.selectedUserToMsg);
    }
  };

  $scope.createNewConversationInDatabase = function(chatId, firstSender, timestamp_updated, participants, group) {
    var conversationData = {
      chatId: chatId,
      firstSender: firstSender,
      timestamp_updated: timestamp_updated,
      participants: participants,
      group: group
    };

    chatServicesSocket.emit('create new conversation in database', conversationData, function(data) {
      console.log('chatServicesSocket.emit emitting create new conversation in database ');
    })
  };
    
  setInterval(function(){
    loadNearbyUsers();
  }, 5000);              

  // var reset = function() {
  //     var inClass = document.querySelectorAll('.in');
  //     for (var i = 0; i < inClass.length; i++) {
  //         inClass[i].classList.remove('in');
  //         inClass[i].removeAttribute('style');
  //     }
  //     var done = document.querySelectorAll('.done');
  //     for (var j = 0; j < done.length; j++) {
  //         done[j].classList.remove('done');
  //         done[j].removeAttribute('style');
  //     }
  //     var ionList = document.getElementByClassName('results-cards-list');
  //     for (var k = 0; k < ionList.length; k++) {
  //         var toRemove = ionList[k].className;
  //         if (/animate-/.test(toRemove)) {
  //             ionList[k].className = ionList[k].className.replace(/(?:^|\s)animate-\S*(?:$|\s)/, '');
  //         }
  //     }
  // };

  // $scope.fadeSlideIn = function() {
  //     reset();
  //     document.getElementsByTagName('div')[0].className += ' animate-fade-slide-in';
  //     setTimeout(function() {
  //         ionicMaterialMotion.fadeSlideIn();
  //     }, 500);
  // };

  // // $scope.fadeSlideIn();
  // // $timeout(function() {
  // //     ionicMaterialMotion.fadeSlideIn({
  // //         selector: '.animate-fade-slide-in .item'
  // //     });
  // // }, 200);

  // // Activate ink for controller
  // ionicMaterialInk.displayEffect();

});



// add extra line at end












