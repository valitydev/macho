function s3(): string {
    return Math.floor((1 + Math.random()) * 100).toString();
}

function s2(): string {
    return Math.floor((1 + Math.random()) * 10).toString();
}

function ric(): string {
    return `${s3()}-${s3()}-${s3()} ${s2()}`;
}

export default ric;
