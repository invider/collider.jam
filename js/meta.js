const env = require('./env')
const types = require('./types')

module.exports = {

    sync: function (data) {
        env.cache.help = data
        types.generate(env.cache.help)

        console.log('>>> SYNC <<<')
    },

    autocomplete: function(context, file) {
        console.log('autocomplete ' + context + 
            + 'from ' + file)

        const res = [
            'p property',
            'p function',
            'p property2',
            'p function2',
        ].join('\n')

        return res
    },

    definition: function(context, file) {
        const res = [
                    '/home/shock/dna/jam/collider.mix/pub/collider.js 11 4'
        ].join('\n')

        return res
    },
}
