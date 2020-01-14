
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
    tags.innerHTML += '<li>' + content
}

function metaSummary(meta) {
    if (meta.link) {
        const linkMeta = identify(meta.link)
        if (linkMeta) meta = linkMeta
        else meta.type = 'link'
    }

    let res = `<a href="#n${meta.id}">`
        + meta.type + ' <b>' + meta.name + '</b>'
        + (meta.data? ' - ' + meta.data.head : '')
        + '</a>'
    return res
}

function metaToHtml(meta) {
    const res = {}


    res.tag = `<a href="#n${meta.id}">${meta.path}</a>`

    let body = `<div id="n${meta.id}" class="meta">`
        + `<div class="path">${meta.path}</div>`

    let head = ''
    if (meta.type === 'object' && meta.proto) {
        head += meta.proto + ' <b>' + meta.name + '</b>'
    } else {
        head += meta.type + ' <b>' + meta.name + '</b>'
    }
    head += (meta.data? ' - ' + meta.data.head : '')

    body += `<div class="metaHead">${head}</div>`


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
    res.forEach(meta => {
        const out = metaToHtml(meta)
        printTag(out.tag)
        print(out.body)
    })

    printTag(`<b>Total Results: ${res.length}</b>`)
}

function filter(data, string, tags) {
    const res = []
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
            console.log('ignoring ' + meta.name + ' - ' + meta.type
            + ' - ' + meta.link)
        }
    }
    subfilter(data)

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

function index(meta) {
    if (!meta) return
    if (meta.link) return
    if (cache.index[meta.id]) return

    cache.index[meta.id] = meta

    if (meta.dir) Object.values(meta.dir).forEach(submeta => {
        index(submeta)
    })
}

function update(data) {
    cache.data = data
    cache.index = {}
    cache.results = {}
    index(data)
    search(data, '')
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

    field.onkeyup = function() {
        search(cache.data, field.value)
    }

    loadMeta()
}

window.onload = setup
window.onkeydown = function(e) {
    if (e.repeat) return

    if (e.code === 'Escape' || e.code === 'Backspace') {
        const field = document.getElementById(FIELD)
        field.focus()
    }
}
