import * as request from 'request';
import * as http from 'http';
import * as chai from 'chai';
import * as moment from 'moment';
import * as chaiMoment from 'chai-moment-js';

import { ShortUrls } from '../api/url-shortener-v1';
import { AuthActions } from '../actions';

chai.use(require('chai-url'));
chai.use(chaiMoment);
chai.should();

describe('Short URL', () => {
    let accessToken: string;

    before(async () => {
        accessToken = await AuthActions.authExternal('url-shortener');
    });

    const sourceUrl = 'http://checkout.rbk.test:8080/checkout.html';
    let shortenedUrlID: string;
    let shortenedUrl: string;

    it('should be issued successfully', async () => {
        const shortUrls = new ShortUrls(accessToken);
        const expiresAt = moment().add(1, 'minutes');
        const result = await shortUrls.shortenUrl(sourceUrl, expiresAt.toDate().toISOString());
        result.id.should.be.a('string');
        result.shortenedUrl.should.be.a('string');
        // @ts-ignore
        result.shortenedUrl.should.have.hostname('short.rbk.test');
        result.expiresAt.should.be.same.moment(expiresAt);
        result.sourceUrl.should.be.eq(sourceUrl);
        shortenedUrlID = result.id;
        shortenedUrl = result.shortenedUrl;
    });

    it('should be resolved successfully', done => {
        let req = { url: shortenedUrl, followRedirect: false };
        request(req, (error, response: http.IncomingMessage, body) => {
            if (error) {
                return done(error);
            }
            response.statusCode.should.be.eq(301, body);
            response.headers.location.should.not.be.undefined;
            response.headers.location.should.be.eq(sourceUrl);
            done();
        });
    });

    it('should be deleted successfully', () => {
        const shortUrls = new ShortUrls(accessToken);
        return shortUrls.deleteShortenedUrl(shortenedUrlID);
    });

    it('should not be resolved anymore', done => {
        request(shortenedUrl, (error, response: http.IncomingMessage, body) => {
            if (error) {
                return done(error);
            }
            response.statusCode.should.be.eq(404, body);
            response.headers.should.not.have.property('location');
            done();
        });
    });
});
