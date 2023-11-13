// Detect Loading finished on Docsify
// Do not create a new file, just add this code to the existing $docsify object
let questionNumber = 0;

window.$docsify = {
    name: 'Ansible training',
    repo: 'https://github.com/guillaume-elambert/ansible-training',
    coverpage: true,
    loadSidebar: true,
    loadNavbar: true,
    alias: {
        '.*/_sidebar.md': '_sidebar.md',
        '.*/_navbar.md': '_navbar.md'
    },
    maxLevel: 4,
    subMaxLevel: 4,
    search: {
        noData: 'No results!',
        paths: 'auto',
        placeholder: 'Search',
    },
    themeColor: '#25798A',
    pagination: {
        crossChapter: true,
        crossChapterText: true,
    },
    auto2top: true,
    zoomImage:{
        background: "#00000050",
        margin: 50,
    },
    beforeElements : [
        {
            referenceNodeRegexSelector: '^ *< *question *>',
            htmlToAddBefore: "<div class='question'>\n\n{{nextTitleLevel}} <question-introducer><i class='fa-solid fa-brain'></i>  Question {{questionNumber}}</question-introducer>",
            whenFounded: function(originalLine, editedLine, currentRoute){

                questionNumber++;
                editedLine = editedLine.replaceAll('{{questionNumber}}', questionNumber);
                
                return editedLine;
            },
            afterEveryMatch: function(modifiedMarkdow){
                questionNumber = 0;
                lastRoutePath = null;
            }
        },
    ],
    plugins: [
        function (hook, vm) {

            hook.doneEach(function () {
                handleUrlPointingToDetails(vm.route.query.id);
                handleLinksInSummary();
            });

            hook.beforeEach(function (markdown) {
                return handleAdditionnalElementsBefore(vm, markdown);
            });

            hook.beforeEach(function (markdown) {
                url = 'https://github.com/guillaume-elambert/ansible-training/blob/docs/' + vm.route.file;
                let editMarkdown = '[:memo: Edit Document](' + url + ')\n';

                markdown = replaceFontAwesomeIcons(markdown);

                return (
                    editMarkdown +
                    markdown
                );
            });

        }
    ]
}


/**
 * Check if the URL contains a search parameter "id" and if so open the corresponding <details> element if needed.
 * @param {string} id The id of the element that will be focused when the page will be loaded
 */
function handleUrlPointingToDetails(id = '') {

    if (!id || id === '') {
        return;
    }

    const element = document.getElementById(id);
    let details;
    // Check that the element exists and is inside a <details> element
    if (element && (details = element.closest('details'))) {
        details.setAttribute('open', '');
    }
}


/**
 * Function to handle links inside <details> elements.
 */
function handleLinksInSummary() {
    document.querySelectorAll('details > summary a').forEach(function (link) {
        //Get the first parent node of the link that is a <details> element
        var details = link.closest('details');

        // Add a click event listener to the link
        link.addEventListener("click", function (event) {

            const toUrl = new URL(link.href);

            // Entrering : the outgoing link is not an external link
            //          => we want to push the new URL to the browser history without reloading the page
            if (toUrl.origin === window.location.origin) {
                // Push the new URL to the browser history without reloading the page
                window.history.pushState(null, null, link.href);

                // Set the url to the link href but without reloading the page
                event.preventDefault();
            }


            details.toggleAttribute('open');
        });
    });
}

/**
 * Function to add elements before other elements.
 * It requires a "beforeElements" object in the Docsify configuration.
 * The "beforeElements" object is an array of objects. Each of these objects must have the following properties :
 * - referenceNodeRegexSelector : a query selector that will be used to select the reference nodes
 * - htmlToAddBefore : the HTML string that will be used to create the new element(s) that will be added before the reference node
 * - specialHandler : a function that will be called after the new element(s) have been added to the DOM
 * @param {*} vm The Docsify object
 * @param string markdown The markdown to parse
 */
function handleAdditionnalElementsBefore(vm, markdown){
    if(!vm || !vm.config?.beforeElements || !markdown || !markdown.trim()) return;
    
    let editedMarkdown = "";
    let lastTitle = null;
    let lastTitleLevel = null;

    // Iterate over all the elements that should be added before another element
    vm.config.beforeElements.forEach(function(referenceNodeSelector){
        if(!referenceNodeSelector.referenceNodeRegexSelector) return;

        // Go through the markdown string and look for the reference node
        const regex = new RegExp(referenceNodeSelector.referenceNodeRegexSelector, 'g');

        // Copy each line that doesn't match the regex to the editedMarkdown string
        markdown.split('\n').forEach(function(line){

            if((lastTitle = line.match(/^#+/))){
                // count the number of # in the title
                lastTitleLevel = lastTitle[0].length;
            }

            let modifiedLine = "";

            if(line.match(regex)) {
                let toAdd = referenceNodeSelector.htmlToAddBefore;
                
                // Add lastTitleLevel * '#' to the editedMarkdown
                if(lastTitleLevel){
                    toAdd = toAdd.replaceAll('{{nextTitleLevel}}', '#'.repeat(lastTitleLevel + 1)).replaceAll('{{titleLevel}}', '#'.repeat(lastTitleLevel));
                }
                
                // Add the HTML string before the reference node
                modifiedLine += toAdd + '\n' + line;

                // whenFounded and is called after the new element(s) have been added
                if(referenceNodeSelector.whenFounded && typeof referenceNodeSelector.whenFounded === 'function'){
                    modifiedLine = referenceNodeSelector.whenFounded(line, modifiedLine, vm?.route);
                }

                line = modifiedLine;
            }
                        
            editedMarkdown += line + '\n';
        });

        markdown = editedMarkdown;

    });

    
    console.log(markdown);
    
    if(vm.config.afterEveryMatch && typeof vm.config.afterEveryMatch === 'function'){
        markdown = vm.config.afterEveryMatch(markdown);
    }

    return markdown;
}


/**
 * Replace all the :fa-type the icon: color: with the corresponding iconify icon
 * @param markdown the markdown to parse
 */
function replaceFontAwesomeIcons(markdown) {
    const regex = /:(fa(?:-\w+)?) ([\w-]+) ?([#\w]+)? ?([\w-.]+)?:/g;

    //Should match numeric values with or without units
    const regexNumericSize = /(\d+(\.\d+)?)(px|em|rem|%)?/;


    return markdown.replaceAll(regex, function (match, style, icon, color, size) {
        // Check if icon starts with "fa-" and if not, add it
        if (icon && !icon.startsWith('fa-')) {
            icon = 'fa-' + icon;
        }

        let sizeClass = '';
        let numericSize = '';


        let css = "";

        if(size){
            // Check if size is a numeric value and return the matched values
            const match = size.match(regexNumericSize);

            // Entering : the size is a numeric value
            if(match){
                numericSize = match[1] + (match[3] || 'em');
                css += `font-size: ${numericSize};`;
            }
            // Check if sizeClass starts with "fa-" and if not, add it
            else if (!sizeClass.startsWith('fa-')) {
                sizeClass = 'fa-' + sizeClass;
            }
        }

        if (color) {
            css += `color: ${color || 'currentColor'};`;
        }

        if (css !== "") {
            css = `style="${css}"`;
        }

        return `<i class="${style + ' ' || ''}${icon + ' ' || ''}${sizeClass || ''}" ${css || ''}></i>`;
    });
}