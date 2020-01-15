
const FIELD = 'searchField'

const DATA_MISSING = 'Missing help data!<br>'
                + 'Make sure jam is running '
                + 'in debug and dynamic mode:<br>'
                + '<pre><code>    jam -d</code></pre>'
                + 'and you have loaded project page after.'

let gfield

var state = {}
var cache = {}

function identify(id) {
    if (cache.index) return cache.index[id]
}

function parentPath(path) {
    if (path === '/') return
    const i = path.lastIndexOf('/')

    if (i < 0) return

    if (i === 0) return '/'
    else return path.substring(0, i)
}

function clear() {
    const help = document.getElementById('help')
    const tags = document.getElementById('tags')
    help.innerHTML = ''
    tags.innerHTML = ''
}

function print(content) {
    const help = document.getElementById('help')
    help.innerHTML += '<p>' + content + '</p>'
}

function printTag(content) {
    const tags = document.getElementById('tags')
    tags.innerHTML += content
}

function metaSummary(meta) {
    if (meta.link) {
        const linkMeta = identify(meta.link)
        if (linkMeta) meta = linkMeta
        else meta.type = 'link'
    }

    let res = `<a href="#.${meta.path}">`
        + meta.type + ' <b>' + meta.name + '</b>'
        + (meta.data? ' - ' + meta.data.head : '')
        + '</a>'
    return res
}

function metaTag(meta) {
    let res = `<div class="tag" onclick="location.href='#.${meta.path}';">`

    let path = parentPath(meta.path)
    if (meta.kind === 'page' || !path) path = ''

    res += `<div class="tagPath">${path}</div>`
        + `<div class="tagTitle">${meta.name}</div>`
        + `<div>`

    return res
}

function pageToHtml(page) {
    const res = {}

    /*
    res.tag = `<div class="tag"><a href="#.${page.path}">${page.title}</a></div>`
    */
    res.tag = metaTag(page)

    let body = `<div id=".${page.path}" class="meta">`
    
    const head = `${page.name}`
    body += `<div class="metaHead">${head}</div>` 
    body += '<hr>'
    body += `<pre>${page.body}</pre>`
    body += '</div>'
    cache.links[page.id] = page
    cache.links[page.path] = page

    res.body = body
    return res
}

function metaToHtml(meta) {
    const res = {}

    res.tag = metaTag(meta)

    let body = `<div id=".${meta.path}" class="meta">`
    cache.links[meta.id] = meta
    cache.links[meta.path] = meta

    const upPath = parentPath(meta.path)
    if (upPath) {
       body +=  `<div class="path">`
            + `<a href="#.${upPath}" class="pathLink">`
            + `${upPath}</a></div>`
    } else {
        //body += `<div class="path">${meta.path}</div>`
    }

    let head = ''
    if (meta.type === 'object' && meta.proto) {
        head += meta.proto + ' <b>' + meta.name + '</b>'
    } else {
        head += meta.type + ' <b>' + meta.name + '</b>'
    }
    head += (meta.data? ' - ' + meta.data.head : '')

    let headClass = meta.data? 'metaHead' : 'missingHead'
    body += `<div class="${headClass}">${head}</div>`

    if (meta.dir) {
        const vals = Object.values(meta.dir)
        if (vals.length > 0) {
            body += '<hr>'
            vals.forEach(n => {
                body += '<li>' + metaSummary(n)
            })
        }
    }

    body += '</div>'
    /*
    body =
    meta.path + '<br>'
        + meta.type + ' <b>' + meta.name + '</b>'
        + (meta.data? ' - ' + meta.data.head : ''))
    */

    res.body = body
    return res
}

function printResults(res) {
    // TODO cache that in result obj?
    cache.links = {}

    res.forEach(meta => {
        let out
        if (meta.kind === 'page') out = pageToHtml(meta)
        else out = metaToHtml(meta)

        printTag(out.tag)
        print(out.body)
    })

    printTag(`<b>Total Results: ${res.length}</b>`)
}

function open(locator) {
    const meta = cache.index[locator]
    if (!meta) return

    const res = [ meta ]
    clear()
    printResults(res)

    state.result = res
    state.searchString = '#.' + locator
    cache.results[state.searchString] = res

    return meta
}

function filter(data, string, tags) {
    const res = []

    function filterPages(dir) {
        // now processing flat without subfolders
        Object.values(dir).forEach(page => {
            if (page.path.toLowerCase().includes(string)) {
                // dirty rule - intro page should always be first
                if (page.path === 'intro') res.unshift(page)
                else res.push(page)
            }
        })
    }

    function subfilter(meta) {
        if (!meta) return

        if (meta.kind === 'Frame' || meta.dir) {
            if (meta.name
                    && meta.name.toLowerCase().includes(string)) {
                res.push(meta)
            }
            Object.values(meta.dir).forEach(submeta => {
                subfilter(submeta)
            })

        } else if (meta.type === 'function') {
            if (meta.name
                    && meta.name.toLowerCase().includes(string)) {
                res.push(meta)
            }

        } else {
            //console.log('ignoring ' + meta.name + ' - ' + meta.type
            //+ ' - ' + meta.link)
        }
    }

    filterPages(data.pages)
    subfilter(data.scene)

    return res
}

function search(data, string) {
    if (state.searchString === string) return

    clear()

    let res
    if (cache.results[string]) {
        res = cache.results[string]
        console.log('found in cache')
    } else {
        res = filter(data, string.trim().toLowerCase())
    }
    printResults(res)
    state.result = res
    state.searchString = string

    cache.results[string] = res
}

function setSearch(string) {
    location.hash = encodeURI(string)
}

function index(meta) {
    if (!meta) return
    if (meta.link) return
    if (cache.index[meta.id]) return

    cache.index[meta.id] = meta
    if (meta.path) cache.index[meta.path] = meta

    if (meta.dir) Object.values(meta.dir).forEach(submeta => {
        index(submeta)
    })
}

function update(data) {
    cache.data = data
    cache.index = {}
    cache.results = {}
    index(data.scene)
    // TODO make meta processing more generic
    Object.values(data.pages).forEach(p => index(p))
    //search(data, '')
    syncHash()
}

function showError(msg) {
    clear()
    print(`<h3>${msg}</h3>`)
}

function loadMeta() {

    fetch('help/data').then(res => {
        if (res.status !== 200) return
        return res.json()
    }).then(json => {
        if (json) {
            update(json)
        } else {
            // TODO handle various errors with proper messages
            showError(DATA_MISSING)
        }
    }).catch(err => {
        console.dir(err)
        showError(DATA_MISSING)
    })
}

function setup() {
    const field = document.getElementById(FIELD)

    field.onkeyup = function(e) {
        if (e.code === 'Enter') {
            setSearch(field.value)
            field.blur()
            //field.value = ''
        } else {
            search(cache.data, field.value)
        }
    }

    if (!location.hash.startsWith('#.')) {
        field.value = decodeURI(location.hash.substring(1))
    }

    loadMeta()
}



function syncHash() {
    if (!cache.data) {
        // no metadata yet
        setTimeout(syncHash, 100)
        return
    }

    if (!location.hash.startsWith('#.')) {
        const searchString = decodeURI(location.hash.substring(1))

        if (searchString !== cache.searchString) {
            search(cache.data, searchString)
        }

    } else {
        const link = location.hash.substring(2)

        if (!cache.links) {
            // nothing is printed - just open
            const meta = open(link)
        }

        if (!cache.links[link]) {
            // looks like the object is not printed
            // need to search and show it by id
            const meta = open(link)
        }
    }
}

window.onload = setup

window.onhashchange = syncHash 

window.onkeydown = function(e) {
    if (e.repeat) return

    if (e.code === 'Escape' || e.code === 'Backspace') {

        const field = document.getElementById(FIELD)

        if (document.activeElement === field) {
            field.value = ''
            setSearch('')
        } else {
            field.focus()
        }
    }
}

