angular.module("starter.services")
    .factory("itemService", function ($q) {
        var self = this;
        var items = [];

        var save = function(){
            window.localStorage.setItem("ionicgood", angular.toJson(items));
        };

        var load = function(){
            var result = JSON.parse(window.localStorage.getItem("ionicgood")) || [];
            console.log(result);
            for(var i=0;i<result.length; i++){
                switch(result[i].type){
                    case "person":
                        result[i] = new Person(result[i]);
                        break;
                    case "note":
                        result[i] = new Note(result[i]);
                        break;
                    case "photo":
                    case "scan":
                        result[i] = new _Image(result[i]);
                        break;
                }

                items[i] = result[i];
            }
        };
        load();

        var getItemIndex = function (obj) {
            var index = -1;

            for(var i=0; i<items.length; i++){
                if(obj.$$hashKey == items[i].$$hashKey){
                    index = i;
                    item = items[i];
                }
            }

            return index;
        };

        this.getItems = function (filter) {
            var result = [];
            if(filter){
                console.log("getItems has a filter:", filter);
                for(var i=0; i<items.length; i++){
                    var item = items[i];
                    console.log(item);
                    var match = true;
                    for(var key in filter){
                        if(item.hasOwnProperty(key)) {
                            console.log(key);
                            if(item[key]!=filter[key]){ match=false; }
                        }else{ match=false; }
                    }
                    if(match){
                        result.push(item);
                    }
                }



                //result = items.filter(function(a){
                //    return a.type.toLowerCase() === type.toLowerCase();
                //});
            }else {
                result = items;
            }

            return result;
        };

        this.addItem = function(item){
            var defer = $q.defer();

            if(!item || !item.type){ defer.reject("Invalid item"); }

            if(item.type==='person'){
                console.log("prevent duplicate persons");
                var hasDuplicate = false;
                for (var i = 0; i < items.length; i++) {
                    if (angular.toJson(items[i].sleutel)==angular.toJson(item.sleutel)) {
                        hasDuplicate = true;
                        break;
                    }
                }
            }

            if(hasDuplicate){
                defer.reject({error: 999, message:"Duplicate entry"});
            }else{
                items.push(item);
                save();
                defer.resolve();
            }

            return defer.promise;
        };

        this.removeFromCart = function (obj) {
            var index = getItemIndex(obj);
            if(item.type && item.type==="person"){
                items.splice(index, 1);
            }else {
                item.inCart = false;
            }
            save();
        };

        this.remove = function (obj) {
            var index = getItemIndex(obj);
            items.splice(index, 1);
            save();
        };

        this.itemProcessed = function (obj) {
            var index = getItemIndex(obj);
            if(item.type && item.type==="person"){
                items.splice(index, 1);
            }else {
                item.inCart = false;
                item.checkedInCart = false;
                item.isSent = true;
            }
            save();
        };

        this.save = function () {
            save();
        };

        return this;
    });