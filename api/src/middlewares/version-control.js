const addVersion = (req, res, next) => {
    let version = 0;
    if (!!req.token && !!req.token.agent && !!req.token.agent.actualVersion)
        version = req.token.agent.actualVersion.split('.')[0];
    req.version = version;
    next();
}
module.exports = addVersion;
