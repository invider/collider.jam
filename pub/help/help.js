
const FIELD = 'searchField'

const DATA_MISSING = 'Missing help data!<br>'
                + 'Make sure jam is running '
                + 'in debug and dynamic mode:<br>'
                + '<pre><code>    jam -d</code></pre>'
                + 'and you have loaded project page after.'

let gfield

const state = {}
const cache = {}

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
    let res = meta.type + ' <b>' + meta.name + '</b>'
        + (meta.data? ' - ' + meta.data.title : '')
    return res
}

function metaToHtml(meta) {
    const res = {}

    res.tag = `<a href="#n${meta.id}">${meta.path}</a>`

    res.body = `<div id="n${meta.id}">`
        + meta.path + '<br>'
        + meta.type + ' <b>' + meta.name + '</b>'
        + (meta.data? ' - ' + meta.data.title : '')
        + '</div>'

    if (meta.dir) {
        Object.values(meta.dir).forEach(n => {
            res.body += '<li>' + metaSummary(n)
        })
    }
    /*
    res.body =
    meta.path + '<br>'
        + meta.type + ' <b>' + meta.name + '</b>'
        + (meta.data? ' - ' + meta.data.title : ''))
    */

    return res
}

function printResults(res) {
    res.forEach(meta => {
        const out = metaToHtml(meta)
        printTag(out.tag)
        print(out.body)
    })
}

function filter(data, string, tags) {
    const res = []
    function subfilter(meta) {
        if (!meta) return
        if (meta.type === 'function') {
            if (meta.name
                    && meta.name.toLowerCase().includes(string)) {
                res.push(meta)
            }
        } else if (meta.dir) {
            if (meta.name
                    && meta.name.toLowerCase().includes(string)) {
                res.push(meta)
            }
            Object.values(meta.dir).forEach(submeta => {
                subfilter(submeta)
            })
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

function update(data) {
    cache.data = data
    cache.results = {}
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
