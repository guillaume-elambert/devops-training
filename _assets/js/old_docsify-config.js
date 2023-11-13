// Detect Loading finished on Docsify
// Do not create a new file, just add this code to the existing $docsify object
let questionNumber = 0;
let lastRoutePath = null;

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
            referenceNodeQuerySelectorAll: '.markdown-section details.question',
            htmlToAddBefore: '<question-introducer id="question-{{questionNumber}}"><i class="fa-solid fa-brain"></i>  Question {{questionNumber}}:</question-introducer>',
            specialHandler: function(referenceNode, createdElements, vm){
                if(!referenceNode || !createdElements || createdElements.length == 0) return;

                if(lastRoutePath !== vm?.route?.path){
                    questionNumber = 0;
                    lastRoutePath = vm?.route?.path;
                }
                
                // In the createdElements nodes, look for {{questionNumber}} and replace it with the question number
                createdElements.forEach(function(element){
                    element.innerHTML = element.innerHTML.replaceAll('{{questionNumber}}', ++questionNumber);
                    // Edit all attributes that contains {{questionNumber}} and replace it with the question number
                    for(let i = 0; i < element.attributes.length; i++){
                        element.attributes[i].value = element.attributes[i].value.replaceAll('{{questionNumber}}', questionNumber);
                    }
                });

                // Get the first element before the referenceNode that is a <h*> element
                let nextToSearchIn = referenceNode?.previousElementSibling ?? referenceNode?.parentElement;
                let previousSearchedIn = null;

                let searchedIn = [];

                // Regex to match h[1-9]+[0-9]? elements
                let regex = /^[Hh][1-9]+[0-9]?$/i;
                

                // Search for the first element before the referenceNode that matches the regex
                // If the element has children, look inside it, starting with the last child
                // Then check if the element is a <h*> element
                while(
                    nextToSearchIn 
                    && (
                            !nextToSearchIn.tagName.toUpperCase().match(regex)
                        ||  (nextToSearchIn.children.length > 0 && !searchedIn.includes(nextToSearchIn))
                    )
                ) {
                    previousSearchedIn = nextToSearchIn;

                    // Check if the element has children and if we didn't looked inside it yet
                    // if so, get the last child
                    if(nextToSearchIn.children.length > 0 && !searchedIn.includes(nextToSearchIn)){
                        nextToSearchIn = nextToSearchIn.lastElementChild;
                    } else {
                        nextToSearchIn = nextToSearchIn.previousElementSibling ?? nextToSearchIn.parentElement;
                    }

                    if(previousSearchedIn) searchedIn.push(previousSearchedIn);
                }

                if(!nextToSearchIn || !nextToSearchIn.tagName.toUpperCase().match(regex)) return;
                //if(nextToSearchIn) nextToSearchIn.style.background = "red";
                
                // check if window.$docsify.maxLevel is set and is a number > 0
                if(!window.$docsify?.maxLevel && !isNaN(window.$docsify.maxLevel) && window.$docsify.maxLevel <= 0) return;
                
                // Get the level of the element
                const level = parseInt(nextToSearchIn.tagName.substring(1));
                if(level >= window.$docsify.maxLevel) return;

                // Get inside the .sidebar-nav element, the <li> element that contains the <a> element that has the href attribute that matches the id of the element
                const parentAElement =    document.querySelector(`.sidebar-nav li a[href="#${vm?.route?.path}?id=${nextToSearchIn.id}"]`)
                                       ?? document.querySelector(`.sidebar-nav li a[href="#${vm?.route?.path}"]`)
                
                const parentLiElement = parentAElement.parentElement;
                let ulElement = parentLiElement.querySelector('ul');

                // Check if the <li> element has a <ul> element
                if(!ulElement){
                    // Create a <ul> element
                    ulElement = document.createElement('ul');
                    ulElement.classList.add('app-sub-sidebar');
                    parentLiElement.after(ulElement);
                }

                // Create a <li> element
                const liElement = document.createElement('li');

                // Create a <a> element
                const aElement = document.createElement('a');

                aElement.classList.add('section-link', 'question-link');

                aElement.setAttribute('href', `#${vm?.route?.path}?id=${createdElements[0].id}`);
                createdElements.forEach(
                    (element) => {
                        aElement.innerHTML += element.innerHTML ?? element.innerText ?? element.textContent ?? '';
                        aElement.title += element.innerText ?? element.textContent ?? '';
                    }
                );

                let txtValue = nextToSearchIn.innerText ?? nextToSearchIn.textContent ?? '';
                aElement.title = (aElement.title + " " + txtValue).trim();
                aElement.innerHTML += " " + txtValue;

                // Add the <a> element to the <li> element
                liElement.appendChild(aElement);

                // Add the <li> element to the <ul> element
                ulElement.appendChild(liElement);

                let tocElement = {
                    level: level + 1,
                    title: aElement.title,
                    slug: aElement.getAttribute('href'),
                };

                if(!vm?.compiler?.cacheTOC) return;

                let addInObject = function(object){
                    // For each element in the object
                    for(let [parentKey, parentValue] of Object.entries(object)){
                        for(let element of parentValue){
                            if(element.level !== level ) continue;
                            if(element.title !== (nextToSearchIn.innerText ?? nextToSearchIn.textContent ?? '').trim()) continue;
                            if(element.slug !== `#${vm?.route?.path}?id=${nextToSearchIn.id}` && element.slug !== `#${vm?.route?.path}`) continue;

                            parentValue.children = [...parentValue.children ?? [], element];
                            object[parentKey] = parentValue;
                            return;
                        };
                    }
                };

                // In vm.cacheToc, look for the parent element of the element that will be added
                // If it exists, add the element to the parent element
                addInObject(vm.compiler.cacheTOC);
                addInObject(vm.compiler.cacheTree);
                
            }
        },
    ],
    plugins: [
        function (hook, vm) {

            hook.doneEach(function () {
                handleUrlPointingToDetails(vm.route.query.id);
                handleLinksInSummary();
                handleAdditionnalElementsBefore(vm);
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
 * - referenceNodeQuerySelectorAll : a query selector that will be used to select the reference nodes
 * - htmlToAddBefore : the HTML string that will be used to create the new element(s) that will be added before the reference node
 * - specialHandler : a function that will be called after the new element(s) have been added to the DOM
 * @param {*} vm The Docsify object
 */
function handleAdditionnalElementsBefore(vm){
    if(!vm || !vm.config?.beforeElements) return;
    
    // Iterate over all the elements that should be added before another element
    vm.config.beforeElements.forEach(function(referenceNodeSelector){
        if(!referenceNodeSelector.referenceNodeQuerySelectorAll) return;

        document.querySelectorAll(referenceNodeSelector.referenceNodeQuerySelectorAll).forEach(function(referenceNode){
            // Create the new element from the HTML string elementToAdd.htmlToAddBefore
            const newElement = document.createElement('div');
            newElement.innerHTML = referenceNodeSelector.htmlToAddBefore;

            elementsFromHTML = newElement.childNodes;
            // Create a NodeList named createdElements
            let createdElements = [];

            // Add the new elements before the element
            elementsFromHTML.forEach(function(newElement){
                createdElements = [referenceNode.parentNode.insertBefore(newElement, referenceNode), ...createdElements];
            });

            // Call the special handler if it exists
            if(referenceNodeSelector.specialHandler){
                referenceNodeSelector.specialHandler(referenceNode, createdElements, vm);
            }
        });
    });
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