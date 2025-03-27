let domains;
let links;
let domainNames;
fetch('./urls.json').then(response => response.json()).then(urls => {
    domains = urls.domains;
    links = urls.links;
    domainNames = Object.keys(urls.domains);

    document.getElementById("manifest1").innerHTML = getOptionsInnerHTML(domainNames);
    document.getElementById("manifest2").innerHTML = getOptionsInnerHTML(domainNames);
});

function compareManifests() {
    let barnURL;
    let manifestURL;
    let barn2URL;
    let manifest2URL;

    barnURL = domains[document.getElementById("manifest1").value];
    barn2URL = domains[document.getElementById("manifest2").value];
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

    let manifest = [];
    let manifest2 = [];

    document.getElementById("main").innerHTML = `<pre>Querying <a href="${manifestURL}">${manifestURL}</a></pre>`;
    fetch(manifestURL).then(response => response.json()).then(manifest => {
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
            let newText = '<table id="mainTable" style="width:100%"><tbody><tr><th>Newer Version</th><th>Older version</th></tr>';
            Object.keys(manifest).sort().forEach(key => {
                if (!manifest2[key]) {
                    diffFound = true;
                    newText = `${newText}<tr><th><a href="${barnURL}">${barn2URL}</a></th><th><a href="${barn2URL}">${barn2URL}</a></th></tr><tr><td>${formatManifestData(manifest[key])}</td><td>Not Present</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
                } else {
                    if (manifest[key].bundle != manifest2[key].bundle) {
                        diffFound = true;
                        if (manifest[key].updated > manifest2[key].updated) {
                            newText = `${newText}<tr><th><a href="${barnURL}">${barnURL}</a></th><th><a href="${barn2URL}">${barn2URL}</a></th></tr><tr><td>${formatManifestData(manifest[key])}</td><td>${formatManifestData(manifest2[key])}\n</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
                        } else {
                            newText = `${newText}<tr><th><a href="${barn2URL}">${barn2URL}</a></th><th><a href="${barnURL}">${barnURL}</a></th></tr><tr><td>${formatManifestData(manifest2[key])}</td><td>${formatManifestData(manifest[key])}\n</td></tr><tr><td>&nbsp</td><td>&nbsp</td></tr>`;
                        }
                    }
                }
            });
            document.getElementById("second").innerHTML = `${newText}</tbody></table>`;
        });
    });
    /**/
}

function formatManifestData(data) {
    return `<table style="width:100%"><tbody><tr><th class="nameCell">Name</th><th class="genericCell">Version</th><th class="genericCell">User</th><th class="genericCell">Updated</th><th class="genericCell">Bundle</th></tr><tr><td class="nameCell">${data.name}</td><td class="genericCell">${data.version}</td><td class="genericCell">${data.user}</td><td class="genericCell">${data.updated}</td><td class="genericCell"><a href="${data.bundle}">bundle</a></td></tr></tbody></table>`;
}

function getOptionsInnerHTML(domainNames) {
    let innerHTML = '';
    domainNames.forEach(domainName => {
        innerHTML = `${innerHTML}\n<option value="${domainName}">${domainName}</option>`;
    });
    return innerHTML;
}