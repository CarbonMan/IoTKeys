function execute() {
    // extract xx.xx
    var rx = /((\.\d+)|(\d+(\.\d+)?))/g;
    var best = "";
    while ((matches = rx.exec(deviceResponse)) !== null) {
        var match = matches[0];
        if (match && match.length > best.length)
            best = match;
    }

    if (best)
        insert(best);
    else
        insert("N/A");
}
