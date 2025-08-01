let domains;
let links;
let domainNames;
fetch('./urls.json').then(response => response.json()).then(urls => {
    domains = urls.domains;
    links = urls.links;
    domainNames = Object.keys(urls.domains);

    document.getElementById("manifest1").innerHTML = getOptionsInnerHTML(domainNames, 0);
    document.getElementById("manifest2").innerHTML = getOptionsInnerHTML(domainNames, domainNames.length-1);

    let date = new Date();

    document.getElementById("manifest1EndDate").setAttribute("value",  "" + (date.getFullYear() + 1) + "-" + (date.getMonth() + 1).toString().padStart(2,"0") + "-" + date.getDate().toString().padStart(2,"0"));
    document.getElementById("manifest2EndDate").setAttribute("value",  "" + (date.getFullYear() + 1) + "-" + (date.getMonth() + 1).toString().padStart(2,"0") + "-" + date.getDate().toString().padStart(2,"0"));
});

function getManifestURLFromBarnName(barnName) {
    let manifestURL;
    if (barnName != "") {
        let barnURL = getBarnURLFromBarnName(barnName);
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
            case (''):
                manifestURL = '';
                break;
            default:
                console.log(barnURL[7]);
        }
    } else {
        manifestURL = "none";
    }
    return manifestURL;
}

function getBarnURLFromBarnName(barnName) {
    return domains[barnName];
}

function filterManifestByDates(manifest, startDate, endDate) {
    console.log(JSON.stringify(manifest.bots));
    let newBots = [];
    manifest.bots.forEach(item => {
        let updated = item.updated;
        if (updated >= startDate && updated <= endDate) {
            newBots.push(item);
        }
    })
    manifest.bots = newBots;
    return manifest;
}

function compareManifests() {
    let barnURL;
    let manifestURL;
    let barn2URL;
    let manifest2URL;

    let barnName = document.getElementById("manifest1").value;
    let barn2Name = document.getElementById("manifest2").value;

    let manifest1StartDate = new Date(document.getElementById("manifest1StartDate").value).getTime();
    let manifest1EndDate = new Date(document.getElementById("manifest1EndDate").value).getTime();
    let manifest2StartDate = new Date(document.getElementById("manifest2StartDate").value).getTime();
    let manifest2EndDate = new Date(document.getElementById("manifest2EndDate").value).getTime();

    let basicTableText = '<table id="mainTable" class="mainTable"><tbody><tr><th colspan="4">Newer Version</th><th class="deploy">copy deploy data</th><th colspan="4">Older version</th></tr>';
    let newText;

    manifestURL = getManifestURLFromBarnName(barnName);
    manifest2URL = getManifestURLFromBarnName(barn2Name)
    barnURL = getBarnURLFromBarnName(barnName) + links.put;
    barn2URL = getBarnURLFromBarnName(barn2Name) + links.put;

    if (manifestURL != "none" && manifest2URL != "none") {
        document.getElementById("main").innerHTML = `<pre>Querying <a href="${manifestURL}">${manifestURL}</a></pre>`;
        fetch(manifestURL).then(response => {console.log(JSON.stringify(response)); return response.json()}).then(manifest => {
            //document.getElementById("second").innerHTML = `<pre>${JSON.stringify(manifest, null, 2)}</pre>`;
            let newManifest = {};
            manifest = filterManifestByDates(manifest, manifest1StartDate, manifest1EndDate);
            manifest.bots.forEach(item => {
                newManifest[item.name] = item;
            });
            manifest = newManifest;
            document.getElementById("main").innerHTML = `<pre>Querying <a href="${manifestURL}">${manifestURL}</a>\nQuerying <a href="${manifest2URL}">${manifest2URL}</a></pre>`;
            console.log(`Querying ${manifest2URL}`);
            fetch(manifest2URL).then(response2 => response2.json()).then(manifest2 => {
                let newManifest = {};
                manifest2 = filterManifestByDates(manifest2, manifest2StartDate, manifest2EndDate);
                manifest2.bots.forEach(item => {
                    newManifest[item.name] = item;
                });
                manifest2 = newManifest;

                let diffFound = false;
                newText = basicTableText;
                Object.keys(manifest).sort().forEach(key => {
                    if (!manifest2[key]) {
                        diffFound = true;
                        newText = `${newText}<tr><th colspan="4"><a href="${barnURL}">${barnName} barn</a></th><th class="deploy"></th><th colspan="4"><a href="${barn2URL}">${barn2Name} barn</a></th></tr>${formatManifestData(manifest[key], {}, key, manifest[key].bundle, {})}<tr><td colspan="9"></td></tr>`;
                    } else {
                        if (manifest[key].bundle != manifest2[key].bundle) {
                            diffFound = true;
                            if (manifest[key].updated > manifest2[key].updated) {
                                newText = `${newText}<tr><th colspan="4"><a href="${barnURL}">${barnName} barn</a></th><th class="deploy"></th><th colspan="4"><a href="${barn2URL}">${barn2Name} barn</a></th></tr>${formatManifestData(manifest[key], manifest2[key], manifest[key].bundle, manifest2[key].bundle)}<tr><td colspan="9"></td></tr>`;
                            } else {
                                newText = `${newText}<tr><th colspan="4"><a href="${barnURL}">${barnName} barn</a></th><th class="deploy"></th><th colspan="4"><a href="${barn2URL}">${barn2Name} barn</a></th></tr>${formatManifestData(manifest2[key], manifest[key], manifest2[key].bundle, manifest[key].bundle)}<tr><td colspan="9"></td></tr>`;
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
        newText = basicTableText;
        Object.keys(manifest).sort().forEach(key => {
            if (!manifest2[key]) {
                diffFound = true;
                newText = `${newText}<tr><th colspan="4"><a href="${barnURL}">${barnName} barn</a></th><th class="deploy"></th><th colspan="4"><a href="${barn2URL}">${barn2Name} barn</a></th></tr>${formatManifestData(manifest[key], {}, key, manifest[key].bundle, {})}<tr><td colspan="9"></td></tr>`;
            } else {
                if (manifest[key].bundle != manifest2[key].bundle) {
                    diffFound = true;
                    if (manifest[key].updated > manifest2[key].updated) {
                        newText = `${newText}<tr><th colspan="4"><a href="${barnURL}">${barnName} barn</a></th><th class="deploy"></th><th colspan="4"><a href="${barn2URL}">${barn2Name} barn</a></th></tr>${formatManifestData(manifest[key], manifest2[key], manifest[key].bundle, manifest2[key].bundle)}<tr><td colspan="9"></td></tr>`;
                    } else {
                        newText = `${newText}<tr><th colspan="4"><a href="${barnURL}">${barnName} barn</a></th><th class="deploy"></th><th colspan="4"><a href="${barn2URL}">${barn2Name} barn</a></th></tr>${formatManifestData(manifest2[key], manifest[key], manifest2[key].bundle, manifest[key].bundle)}<tr><td colspan="9"></td></tr>`;
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
            manifest = filterManifestByDates(manifest, manifest1StartDate, manifest1EndDate);
            manifest.bots.forEach(item => {
                newManifest[item.name] = item;
            });
            manifest = newManifest;
            document.getElementById("main").innerHTML = `<pre>Querying <a href="${manifestURL}">${manifestURL}</a>\nQuerying <a href="${manifest2URL}">${manifest2URL}</a></pre>`;
            console.log(`Querying ${manifest2URL}`);
            let manifest2 = {};
            let diffFound = false;
            newText = basicTableText;
            Object.keys(manifest).sort().forEach(key => {
                if (!manifest2[key]) {
                    diffFound = true;
                    newText = `${newText}<tr><th colspan="4"><a href="${barnURL}">${barnName} barn</a></th><th class="deploy"></th><th colspan="4"><a href="${barn2URL}">${barn2Name} barn</a></th></tr>${formatManifestData(manifest[key], {}, key, manifest[key].bundle, {})}<tr><td colspan="9"></td></tr>`;
                } else {
                    if (manifest[key].bundle != manifest2[key].bundle) {
                        diffFound = true;
                        if (manifest[key].updated > manifest2[key].updated) {
                            newText = `${newText}<tr><th colspan="4"><a href="${barnURL}">${barnName} barn</a></th><th class="deploy"></th><th colspan="4"><a href="${barn2URL}">${barn2Name} barn</a></th></tr>${formatManifestData(manifest[key], manifest2[key], manifest[key].bundle, manifest2[key].bundle)}<tr><td colspan="9"></td></tr>`;
                        } else {
                            newText = `${newText}<tr><th colspan="4"><a href="${barnURL}">${barnName} barn</a></th><th class="deploy"></th><th colspan="4"><a href="${barn2URL}">${barn2Name} barn</a></th></tr>${formatManifestData(manifest2[key], manifest[key], manifest2[key].bundle, manifest[key].bundle)}<tr><td colspan="9"></td></tr>`;
                        }
                    }
                }
            });
            document.getElementById("second").innerHTML = `${newText}</tbody></table>`;
        });
    }
    /**/
}

function formatManifestData(data, data2, key, bundle, bundle2) {
    let headers = '<th class="nameCell">Name</th><th class="genericCell">Version</th><th class="genericCell">User</th><th class="genericCell">Updated</th>';

    let forwardDeployLink = `<a class="deployLink" onclick="deploy('${key}', '${bundle}')">&#8594;</a>`;
    let reverseDeployLink;
    if (Object.keys(data2).length === 0) {
        reverseDeployLink = '';
    } else {
        reverseDeployLink = `<br/><a class="deployLink" onclick="deploy('${key}', '${bundle2}')">&#8592;</a>`
    }
    return `<tr>${headers}<td rowspan="2"class="deploy">${forwardDeployLink}${reverseDeployLink}<input type="checkbox" class="directDeploySecondary"></input><div class="tooltip" id="${key}">Copied to Clipboard</div></td>${headers}</tr><tr>${formatSingleBot(data)}${formatSingleBot(data2)}</tr>`;
}

function formatSingleBot(data) {
    if (Object.keys(data).length === 0) {
        return '<td colspan="4" class="centerText">Not Found</td>'
    } else {
        let name = data.name.replace('com.recondotech.batch.bots.', '')
        return `<td class="nameCell">${name}</td><td class="genericCell">${data.version}</td><td class="genericCell">${data.user}</td><td class="genericCell">${formatDate(data.updated)}</td>`;
    }
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
    return formatter.format(time);
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