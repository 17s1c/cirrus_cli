import { Demo } from '../../sdk/cirrusSdk.js'
Demo({
    name: 'sss',
    password: '333112',
})
    .then(function(data) {
        alert(JSON.stringify(data))
    })
    .catch(function(err) {
        console.log(err)
    })
