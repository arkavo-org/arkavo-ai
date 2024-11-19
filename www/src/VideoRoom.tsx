import React, { useEffect } from 'react';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'toastr/build/toastr.min.css';

// Declare Janus as a global to work with the Janus SDK from mvideoroom.js
declare const Janus: any;
import adapter from 'webrtc-adapter';

import { server, iceServers } from './settings';

const VideoRoom: React.FC = () => {
    useEffect(() => {
        const loadScripts = async () => {
            // Assign adapter to the global scope to ensure it's available to Janus
            window.adapter = adapter;
            // Load janus.js first, then settings.js and mvideoroom.js
            await import('./janus.js');
            await Promise.all([
                import('./mvideoroom.js'),
            ]);

            Janus.init({
                debug: "all",
                callback: startJanus,
            });
        };


        const startJanus = () => {
            let janus = null;
            let sfutest = null;
            let opaqueId = "videoroomtest-" + Janus.randomString(12);

            Janus.init({
                debug: "all", callback: function () {
                    $('#start').one('click', function () {
                        $(this).attr('disabled', true).unbind('click');

                        if (!Janus.isWebrtcSupported()) {
                            alert("No WebRTC support... ");
                            return;
                        }

                        // Create session
                        janus = new Janus({
                            server,
                            iceServers,
                            success: function () {
                                janus.attach({
                                    plugin: "janus.plugin.videoroom",
                                    opaqueId,
                                    success: function (pluginHandle) {
                                        sfutest = pluginHandle;
                                        Janus.log("Plugin attached! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
                                        Janus.log("This is a publisher/manager");

                                        $('#videojoin').removeClass('hide');
                                        $('#registernow').removeClass('hide');
                                        $('#register').click(registerUsername);
                                    },
                                    error: function (error: any) {
                                        console.error("Error attaching plugin...", error);
                                        alert("Error attaching plugin: " + error);
                                    },
                                });
                            },
                            error: function (error: any) {
                                console.error(error);
                                alert(error);
                            },
                            destroyed: function () {
                                window.location.reload();
                            },
                        });
                    });
                }
            });
        };

        // Register a username function
        const registerUsername = () => {
            const username = $('#username').val();
            if (!username) {
                alert("Please enter a username");
                return;
            }
            // Join room logic here
            // Example: sfutest.send({ message: { request: "join", room: myroom, ptype: "publisher", display: username }});
        };

        loadScripts();
    }, []);

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="pb-2 mt-4 mb-2 border-bottom">
                        <h1>Video Room Demo
                            <button className="btn btn-secondary" id="start">Start</button>
                        </h1>
                    </div>
                    <div id="videojoin" className="mt-4 hide"> {/* Join Room UI */} </div>
                    <div id="videos" className="mt-4 hide"> {/* Video Streams UI */} </div>
                </div>
            </div>
        </div>
    );
};

export default VideoRoom;
