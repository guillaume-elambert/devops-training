// Register a custom DOM element "question-container" that inherits from details 
// and that will be used to display the question number
class QuestionContainer extends HTMLElement {
    static questionNumber = 0;
    static previousRoute = null;
    static questionContainers = [];

    constructor() {
        super();
        if(QuestionContainer.previousRoute !== window.location.href){
            QuestionContainer.questionNumber = 0;
            QuestionContainer.previousRoute = window.location.href;
        }

        this.questionNumber = this.questionNumber ?? ++QuestionContainer.questionNumber;
        this.question = this.getAttribute('question');
        this.questionId = `question-${QuestionContainer.questionNumber}`;
        this.fullQuestionId = window.Docsify.slugify(this.questionId + " " + this.question);
        this.questionTitle = null;
        this.titleInnerHTML = `Question ${this.questionNumber}:`;

        this.beforeChangeTitleSelector = `
            h1[id="${this.fullQuestionId}"],
            h2[id="${this.fullQuestionId}"],
            h3[id="${this.fullQuestionId}"],
            h4[id="${this.fullQuestionId}"],
            h5[id="${this.fullQuestionId}"],
            h6[id="${this.fullQuestionId}"]`;

        this.afterChangeTitleSelector = `
            h1[id="${this.questionId}"],
            h2[id="${this.questionId}"],
            h3[id="${this.questionId}"],
            h4[id="${this.questionId}"],
            h5[id="${this.questionId}"],
            h6[id="${this.questionId}"]`;
            
        QuestionContainer.questionContainers.push(this);
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (newValue !== oldValue) {
            this[attrName] = this.hasAttribute(attrName);
        }
    }

    changeAllLinks(){
        const linksToQuestion = document.querySelectorAll(`a[href*="${this.fullQuestionId}"]`);

        linksToQuestion.forEach(link => {
            // Set the href of the child link to the fullId
            link.href = `${link.href.substring(0, link.href.indexOf(this.questionId) + this.questionId.length)}`;
        });
    }

    changeTitle(){
        // Get the brother element that is a h* element with the id starting with question-{{this.questionNumber}}
        this.questionTitle = this.questionTitle 
                          ?? this.parentNode?.querySelector(this.beforeChangeTitleSelector)
                          ?? this.querySelector(this.afterChangeTitleSelector);

        if(this.questionTitle){
            this.questionTitle.id = this.questionId;
            this.questionTitle.classList.add('question-title');

            const questionIntroducer = this.questionTitle.querySelector('question-introducer');
            
            if(questionIntroducer){
                questionIntroducer.innerHTML = this.titleInnerHTML;
            }

            this.prepend(this.questionTitle);
        }
    }

    connectedCallback() {
        this.innerHTML = `
        <p class="question-text">${this.question}</p>\n\n
        <details class="question">\n\n
            <summary title="Click to expand and see the solution">\n\n
                Solution :\n\n
            </summary>\n\n
            ${this.innerHTML}
        </details>\n\n
        `;
    }
}
                
// Register the custom DOM elements
customElements.define('question-container', QuestionContainer);
var element = null;

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
    subMaxLevel: 5,
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
    addTitleBeforeElements : [
        {
            referenceNodeRegexSelector: '< *question-container\\s*question ?= ?(["\'])(.*)\\1 *>',
            titleToAddBefore: "\n\n{{nextTitleLevel}} <question-introducer><i class='fa-solid fa-brain'></i>Question {{questionNumber}} – {{2}}</question-introducer>\n\n",
            whenFounded: function(referenceNodeMatch, modifiedReferenceNode, currentRoute){

                questionNumber++;
                modifiedReferenceNode = modifiedReferenceNode.replaceAll('{{questionNumber}}', questionNumber);
                
                return modifiedReferenceNode;
            },
            afterAllMatches: function(modifiedMarkdow){
                questionNumber = 0;
                lastRoutePath = null;
                return modifiedMarkdow;
            }
        },
    ],
    plugins: [
        function (hook, vm) {

            hook.doneEach(function () {
                handleUrlPointingToDetails(vm.route.query.id);
                handleLinksInSummary();

                QuestionContainer.questionContainers.forEach(questionContainer => {
                    questionContainer.changeAllLinks();
                    questionContainer.changeTitle();
                });
            });

            hook.ready(function () {
                // If the url contains a path parameter to a specific id, scroll to the element with the corresponding id
                if (vm?.route?.query?.id){
                    element = document.getElementById(vm.route.query.id);

                    if(!element) return;
                    
                    if (vm.route.query.id.match(/question-\d+/) && element.parentElement) {
                        element = element.parentElement;
                    }

                    const y = element.getBoundingClientRect().top + window.scrollY - 10;
                    window.scroll({
                        top: y,
                        behavior: 'smooth'
                    });
                }
            });

            hook.beforeEach(function (markdown) {
                return handleAdditionnalTitleBefore(vm, markdown);
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

questionNumber = 0;

/**
 * Function to add elements before other elements.
 * It requires a "addTitleBeforeElements" object in the Docsify configuration.
 * The "addTitleBeforeElements" object is an array of objects. Each of these objects must have the following properties :
 * - referenceNodeRegexSelector : a query selector that will be used to select the reference nodes
 * - titleToAddBefore : the HTML string that will be used to create the new element(s) that will be added before the reference node
 * - specialHandler : a function that will be called after the new element(s) have been added to the DOM
 * @param {*} vm The Docsify object
 * @param string markdown The markdown to parse
 */
function handleAdditionnalTitleBefore(vm, markdown){
    if(!vm || !vm.config?.addTitleBeforeElements || !markdown || !markdown.trim()) return;
    
    let match = null;

    // Iterate over all the elements that should be added before another element
    vm.config.addTitleBeforeElements.forEach(function(referenceNodeSelector){
        if(!referenceNodeSelector.referenceNodeRegexSelector) return;

        // Go through the markdown string and look for the reference node
        const regex = new RegExp(referenceNodeSelector.referenceNodeRegexSelector, 'g');
        const titleRegex = / *(#+)\s+(.*)/;
        const codeBlockRegex = /```(.|\s)*?```[\w.]*/g;
        let modifiedMarkdown = "";
        let lastIndex = 0;
        const originalReversedMarkdown = markdown.split('\n').reverse().join('\n');
        const markdownLength = markdown.length;

        // Iterate over all the markdown to look for the reference node
        while((match = regex.exec(markdown)) !== null){
            
            // Get the content of the reference node
            const referenceNode = match[0];

            // Get the index of the reference node
            const referenceNodeIndex = match.index;
            const reversedMarkdown = originalReversedMarkdown.substring(markdownLength - referenceNodeIndex).replaceAll(codeBlockRegex, '');

            // Get the first title level that is before the reference node
            // It should start from the end of the string and stop when it finds a title level
            const titleMatch = titleRegex.exec(reversedMarkdown);

            // Cont the number of # in the title level
            const titleLevel = (titleMatch && titleMatch[1] ? titleMatch[1].length : 0) + 1;

            let modifiedReferenceNode = referenceNodeSelector.titleToAddBefore;
                
            // Add titleLevel * '#' to the editedMarkdown
            modifiedReferenceNode = modifiedReferenceNode.replaceAll('{{nextTitleLevel}}', '#'.repeat(titleLevel)).replaceAll('{{titleLevel}}', '#'.repeat(titleLevel - 1));

            // Replace all the {{n}} with the corresponding match
            for(let i = 0; i < match.length; i++){
                modifiedReferenceNode = modifiedReferenceNode.replaceAll('{{' + i + '}}', match[i]);
            }
            
            // Add the HTML string before the reference node
            modifiedReferenceNode += referenceNode;

            // whenFounded and is called after the new element(s) have been added
            if(referenceNodeSelector.whenFounded && typeof referenceNodeSelector.whenFounded === 'function'){
                modifiedReferenceNode = referenceNodeSelector.whenFounded(match, modifiedReferenceNode, vm?.route);
            }

            modifiedMarkdown += markdown.substring(lastIndex, referenceNodeIndex) + modifiedReferenceNode;
            lastIndex = referenceNodeIndex + referenceNode.length;
        }

        markdown = modifiedMarkdown + markdown.substring(lastIndex);

        
    
        if(referenceNodeSelector.afterAllMatches && typeof referenceNodeSelector.afterAllMatches === 'function'){
            markdown = referenceNodeSelector.afterAllMatches(markdown);
        }

    });

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