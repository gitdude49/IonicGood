angular.module('starter.services')
    .factory("thumbnailService", function ($q, $timeout) {
        return new function(){
            var self = this;

            this.canvas = $("<canvas>")[0];
            this.ctx = this.canvas.getContext("2d");

            this.generate = function(data, width, height, quality){
                console.log("--> thumbnailService.generate");
                return $q(function(resolve, reject){
                    try {
                        var q = quality || 1.0;
                        width = width || $(window).width()/3;
                        height = height || $(window).width()/3;

                        console.log("going to $timeout");
                        $timeout(function(){
                            console.log("in $timeout");
                            self.canvas.width = width;
                            self.canvas.height = height;

                            var w,h;
                            var diff;
                            var ratio = data.width / data.height;

                            if(data.width > data.height){
                                // landscape
                                ratio = data.width/data.height;
                                w = Math.round(ratio*width);
                                h = height;

                                console.log(ratio, w, h);
                                diff = (w-width)/2;
                                self.ctx.drawImage(data,-Math.abs(diff),0,w,h);
                            }else{
                                // portrait
                                ratio = data.height/data.width;
                                w = width;
                                h = Math.round(ratio*height);
                                console.log(ratio, w, h);
                                diff = (h-height)/2;
                                self.ctx.drawImage(data,0,-Math.abs(diff),w,h);
                            }
                            console.log("looks like we have a result");
                            resolve(self.canvas.toDataURL("image/jpeg", q));
                        }, 0);
                    } catch(err) {
                        reject(err);
                    }
                });
            };
        };
    });

