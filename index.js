const conditions = {
    populationSize: 7000000000,
    protectedDays: 1000,
    getDetectedDays: 14,
    getHealthyDays: 14,
    R0: 2.2,
    deathRate: 0.035,
    infectionDelayDays: 0,
}

const worldState = {
    sickQueue: [0],
    protectedQueue: [0],
    sickDetectedQueue: [0],
    healthy: conditions.populationSize,
    dead: 0,
    day: 0,
    probMeetHealthy: 1.0
}

function rotateQueue(q, newVal, qLen) {
    q.unshift(newVal)
    if (q.length <= qLen) return 0
    return q.pop()
}

function nextDay(state) {

    let newDead = Math.round(state.sickDetectedQueue[0] * conditions.deathRate)
    state.sickDetectedQueue[0] -= newDead
    let newSick = Math.round(
        totalInfecting(state) * 
        conditions.R0 / (conditions.getDetectedDays - conditions.infectionDelayDays)
        * state.probMeetHealthy
    )
    if (newSick > state.healthy) newSick = state.healthy
    let newDetectedSick = rotateQueue(state.sickQueue, newSick, conditions.getDetectedDays)
    let newHealthy = rotateQueue(state.sickDetectedQueue, newDetectedSick, conditions.getHealthyDays)
    let newUnprotected = rotateQueue(state.protectedQueue, newHealthy, conditions.protectedDays)
    let newState = {
        healthy: state.healthy + newUnprotected - newSick,
        day: state.day + 1,
        dead: state.dead + newDead,
        protectedQueue: state.protectedQueue,
        sickQueue: state.sickQueue,
        sickDetectedQueue: state.sickDetectedQueue
    }
    newState.totalProtected = sumQ(newState.protectedQueue)
    newState.totalDetectedSick = sumQ(newState.sickDetectedQueue)
    newState.totalSick = sumQ(newState.sickQueue) + newState.totalDetectedSick 
    newState.totalInfecting = totalInfecting(newState)
    newState.probMeetHealthy = 1.0 * newState.healthy / (newState.healthy + sumQ(newState.sickQueue) + newState.totalProtected)
    return newState
}

const sumQ = (q) => q.reduce( (total, item) => total + item, 0 )

function totalInfecting(state) {
    let l = state.sickQueue.length
    let infecting = 0
    for (let i=conditions.infectionDelayDays; i<l; i++) {
        infecting += state.sickQueue[i]
    }
    return infecting
}

function makeSick(state, n) {
    state.healthy -= n
    state.sickQueue.unshift(n)
}

function logState(state) {
    if (state.day == 1) console.log(`day,healthy,dead,totalProtected,totalDetectedSick,totalSick,totalInfecting,probMeetHealthy`)
    console.log(`${state.day},${state.healthy},${state.dead},${state.totalProtected},${state.totalDetectedSick},${state.totalSick},${state.totalInfecting},${state.probMeetHealthy}`)
    // console.log({
    //     healthy: state.healthy,
    //     day: state.day,
    //     dead: state.dead,
    //     totalProtected: state.totalProtected,
    //     totalDetectedSick: state.totalDetectedSick,
    //     totalSick: state.totalSick,
    //     totalInfecting: state.totalInfecting,
    //     probMeetHealthy: state.probMeetHealthy
    // })
}


makeSick(worldState, 10)
let state = worldState
for (let i=0; i< 10000; i++) {
    state = nextDay(state)
    logState(state)
    if (state.totalSick == 0) break
}



