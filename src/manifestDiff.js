let domains;
let links;
let domainNames;
fetch('./urls.json').then(response => response.json()).then(urls => {
    domains = urls.domains;
    links = urls.links;
    domainNames = Object.keys(urls.domains);

    document.getElementById("manifest1").innerHTML = getOptionsInnerHTML(domainNames, 0);
    document.getElementById("manifest2").innerHTML = getOptionsInnerHTML(domainNames, 1);
});

function compareManifests() {
    let barnURL;
    let manifestURL;
    let barn2URL;
    let manifest2URL;

    let barnName = document.getElementById("manifest1").value;
    let barn2Name = document.getElementById("manifest2").value;

    if (barnName != "none") {
        barnURL = domains[barnName];
        switch (barnURL[7]) {
            case ('d'):
                manifestURL = barnURL + links.dManifest;
                break;
            case ('s'):
                manifestURL = barnURL + links.sManifest;
                break;
            case ('p'):
                manifestURL = barnURL + links.pManifest;
                break;
            default:
                console.log(barnURL[7]);
        }
    } else {
        manifestURL = "none";
    }

    if (barn2Name != "none") {
        barn2URL = domains[barn2Name];
        switch (barn2URL[7]) {
            case ('d'):
                manifest2URL = barn2URL + links.dManifest;
                break;
            case ('s'):
                manifest2URL = barn2URL + links.sManifest;
                break;
            case ('p'):
                manifest2URL = barn2URL + links.pManifest;
                break;
            default:
                console.log(barn2URL[7]);
        }
    } else {
        manifest2URL = "none";
    }

    if (manifestURL != "none" && manifest2URL != "none") {
        document.getElementById("main").innerHTML = `<pre>Querying <a href="${manifestURL}">${manifestURL}</a></pre>`;
        fetch(manifestURL).then(response => {console.log(JSON.stringify(response)); return response.json()}).then(manifest => {
            //document.getElementById("second").innerHTML = `<pre>${JSON.stringify(manifest, null, 2)}</pre>`;
            let newManifest = {};
            manifest.bots.forEach(item => {
                newManifest[item.name] = item;
            });
            manifest = newManifest;
            document.getElementById("main").innerHTML = `<pre>Querying <a href="${manifestURL}">${manifestURL}</a>\nQuerying <a href="${manifest2URL}">${manifest2URL}</a></pre>`;
            console.log(`Querying ${manifest2URL}`);
            fetch(manifest2URL).then(response2 => response2.json()).then(manifest2 => {
                let newManifest = {};
                manifest2.bots.forEach(item => {
                    newManifest[item.name] = item;
                });
                manifest2 = newManifest;

                let diffFound = false;
                let newText = '<table id="mainTable" style="width:100%"><tbody><tr><th>Newer Version</th><th class="deploy">copy deploy data</th><th>Older version</th></tr>';
                Object.keys(manifest).sort().forEach(key => {
                    if (!manifest2[key]) {
                        diffFound = true;
                        newText = `${newText}<tr><th><a href="${barnURL}">${barnURL}</a></th><th class="deploy"></th><th><a href="${barn2URL}">${barn2URL}</a></th></tr><tr><td>${formatManifestData(manifest[key])}</td><td class="deploy"><a class="deployLink" onclick="deploy('${manifest[key].bundle}')">&#8594;</a><input type="checkbox" class="directDeploySecondary"></input><div class="tooltip" id="${manifest[key].bundle}">Copied to Clipboard</div></td><td>Not Present</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
                    } else {
                        if (manifest[key].bundle != manifest2[key].bundle) {
                            diffFound = true;
                            if (manifest[key].updated > manifest2[key].updated) {
                                newText = `${newText}<tr><th><a href="${barnURL}">${barnURL}</a></th><th class="deploy"></th><th><a href="${barn2URL}">${barn2URL}</a></th></tr><tr><td>${formatManifestData(manifest[key])}</td><td class="deploy"><a class="deployLink" onclick="deploy('${manifest[key].bundle}')">&#8594;</a><input type="checkbox" class="directDeploySecondary"></input><div class="tooltip" id="${manifest[key].bundle}">Copied to Clipboard</div></td><td>${formatManifestData(manifest2[key])}\n</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
                            } else {
                                newText = `${newText}<tr><th><a href="${barn2URL}">${barn2URL}</a></th><th class="deploy"></th><th><a href="${barnURL}">${barnURL}</a></th></tr><tr><td>${formatManifestData(manifest2[key])}</td><td class="deploy"><a class="deployLink" onclick="deploy('${manifest[key].bundle}')">&#8594;</a><input type="checkbox" class="directDeploySecondary"></input><div class="tooltip" id="${manifest[key].bundle}">Copied to Clipboard</div></td><td>${formatManifestData(manifest[key])}\n</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
                            }
                        }
                    }
                });
                document.getElementById("second").innerHTML = `${newText}</tbody></table>`;
            });
        })
            .catch(error => {
                throw(error);
            });
    } else if (manifestURL == "none" && manifest2URL == "none") {
        document.getElementById("main").innerHTML = `<pre>Querying <a href="${manifestURL}">${manifestURL}</a></pre>`;
        let manifest = {};
        document.getElementById("main").innerHTML = `<pre>Querying <a href="${manifestURL}">${manifestURL}</a>\nQuerying <a href="${manifest2URL}">${manifest2URL}</a></pre>`;
        console.log(`Querying ${manifest2URL}`);
        let manifest2 = {};
        let diffFound = false;
        let newText = '<table id="mainTable" style="width:100%"><tbody><tr><th>Newer Version</th><th class="deploy">copy deploy data</th><th>Older version</th></tr>';
        Object.keys(manifest).sort().forEach(key => {
            if (!manifest2[key]) {
                diffFound = true;
                newText = `${newText}<tr><th><a href="${barnURL}">${barn2URL}</a></th><th class="deploy"></th><th><a href="${barn2URL}">${barn2URL}</a></th></tr><tr><td>${formatManifestData(manifest[key])}</td><td class="deploy"><a class="deployLink" onclick="deploy('${manifest[key].bundle}')">&#8594;</a><input type="checkbox" class="directDeploySecondary"></input><div class="tooltip" id="${manifest[key].bundle}">Copied to Clipboard</div></td><td>Not Present</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
            } else {
                if (manifest[key].bundle != manifest2[key].bundle) {
                    diffFound = true;
                    if (manifest[key].updated > manifest2[key].updated) {
                        newText = `${newText}<tr><th><a href="${barnURL}">${barnURL}</a></th><th class="deploy"></th><th><a href="${barn2URL}">${barn2URL}</a></th></tr><tr><td>${formatManifestData(manifest[key])}</td><td class="deploy"><a class="deployLink" onclick="deploy('${manifest[key].bundle}')">&#8594;</a><input type="checkbox" class="directDeploySecondary"></input><div class="tooltip" id="${manifest[key].bundle}">Copied to Clipboard</div></td><td>${formatManifestData(manifest2[key])}\n</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
                    } else {
                        newText = `${newText}<tr><th><a href="${barn2URL}">${barn2URL}</a></th><th class="deploy"></th><th><a href="${barnURL}">${barnURL}</a></th></tr><tr><td>${formatManifestData(manifest2[key])}</td><td class="deploy"><a class="deployLink" onclick="deploy('${manifest[key].bundle}')">&#8594;</a><input type="checkbox" class="directDeploySecondary"></input><div class="tooltip" id="${manifest[key].bundle}">Copied to Clipboard</div></td><td>${formatManifestData(manifest[key])}\n</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
                    }
                }
            }
        });
        document.getElementById("second").innerHTML = `${newText}</tbody></table>`;
    } else {
        manifestURL = (manifestURL == "none" ? manifest2URL : manifestURL)
        document.getElementById("main").innerHTML = `<pre>Querying <a href="${manifestURL}">${manifestURL}</a></pre>`;
        fetch(manifestURL).then(response => response.json()).then(manifest => {
            let newManifest = {};
            manifest.bots.forEach(item => {
                newManifest[item.name] = item;
            });
            manifest = newManifest;
            document.getElementById("main").innerHTML = `<pre>Querying <a href="${manifestURL}">${manifestURL}</a>\nQuerying <a href="${manifest2URL}">${manifest2URL}</a></pre>`;
            console.log(`Querying ${manifest2URL}`);
            let manifest2 = {};
            let diffFound = false;
            let newText = '<table id="mainTable" style="width:100%"><tbody><tr><th>Newer Version</th><th class="deploy">copy deploy data</th><th>Older version</th></tr>';
            Object.keys(manifest).sort().forEach(key => {
                if (!manifest2[key]) {
                    diffFound = true;
                    newText = `${newText}<tr><th><a href="${barnURL}">${barn2URL}</a></th><th class="deploy"></th><th><a href="${barn2URL}">${barn2URL}</a></th></tr><tr><td>${formatManifestData(manifest[key])}</td><td class="deploy"><a class="deployLink" onclick="deploy('${manifest[key].bundle}')">&#8594;</a><input type="checkbox" class="directDeploySecondary"></input><div class="tooltip" id="${manifest[key].bundle}">Copied to Clipboard</div></td><td>Not Present</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
                } else {
                    if (manifest[key].bundle != manifest2[key].bundle) {
                        diffFound = true;
                        if (manifest[key].updated > manifest2[key].updated) {
                            newText = `${newText}<tr><th><a href="${barnURL}">${barnURL}</a></th><th class="deploy"></th><th><a href="${barn2URL}">${barn2URL}</a></th></tr><tr><td>${formatManifestData(manifest[key])}</td><td class="deploy"><a class="deployLink" onclick="deploy('${manifest[key].bundle}')">&#8594;</a><input type="checkbox" class="directDeploySecondary"></input><div class="tooltip" id="${manifest[key].bundle}">Copied to Clipboard</div></td><td>${formatManifestData(manifest2[key])}\n</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
                        } else {
                            newText = `${newText}<tr><th><a href="${barn2URL}">${barn2URL}</a></th><th><a href="${barnURL}">${barnURL}</a></th></tr><tr><td>${formatManifestData(manifest2[key])}</td><td class="deploy"><a class="deployLink" onclick="deploy('${manifest[key].bundle}')">&#8594;</a><input type="checkbox" class="directDeploySecondary"></input><div class="tooltip" id="${manifest[key].bundle}">Copied to Clipboard</div></a></td><td>${formatManifestData(manifest[key])}\n</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
                        }
                    }
                }
            });
            document.getElementById("second").innerHTML = `${newText}</tbody></table>`;
        });
    }
    /**/
}

function formatManifestData(data) {
    return `<table style="width:100%"><tbody><tr><th class="nameCell">Name</th><th class="genericCell">Version</th><th class="genericCell">User</th><th class="genericCell">Updated</th></tr><tr><td class="nameCell">${data.name}</td><td class="genericCell">${data.version}</td><td class="genericCell">${data.user}</td><td class="genericCell">${formatDate(data.updated)}</td></tr></tbody></table>`;
}

function formatDate(timestamp) {
    let time = new Date(timestamp);
    const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true // Use AM/PM format
    });
    return formattedTime = formatter.format(time);
}

function getOptionsInnerHTML(domainNames, selectedOption) {
    let innerHTML = '';
    let currentOption = 0;
    domainNames.forEach(domainName => {
        innerHTML = `${innerHTML}\n<option value="${domainName}"${currentOption == selectedOption ? ' selected="selected"' : ''}>${domainName}</option>`;
        currentOption++;
    });
    return innerHTML;
}