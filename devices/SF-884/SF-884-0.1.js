function execute() {
    // extract xx.xx
    var rx = /((\.\d+)|(\d+(\.\d+)?))/g;
    // var matches = rx.exec(deviceResponse);
    // The device responds with a string 2x the length of the standard scales response
    // It is up to this script to get the value
    //if (!matches || matches.length < 1){
    //    insert("N/A");
    //    return;
    //}
    var best = "";
    while ((matches = rx.exec(deviceResponse)) !== null) {
        var match = matches[0];
        if (match && match.length > best.length)
            best = match;
    }

    //for (var i=0; i<matches.length; i++){
    //    var match = matches[i];
    //    if (match && match.length > best.length)
    //        best = match;
    //}
    if (best)
        insert(best);
    else
        insert("N/A");
}
