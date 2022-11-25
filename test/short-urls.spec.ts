import axios, { AxiosError, AxiosResponse } from 'axios';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiMoment from 'chai-moment';
import chaiUrl from 'chai-url';
import moment from 'moment';

import { ShortUrls } from '../api/url-shortener-v1';
import { AuthActions } from '../actions';

chai.should();
chai.use(chaiUrl);
chai.use(chaiMoment);
chai.use(chaiAsPromised);

describe('Short URL', () => {
    let accessToken: string;

    before(async () => {
        accessToken = await AuthActions.authExternal();
    });

    // FIXME
    const sourceUrl = 'http://localhost:8000/checkout.html';
    let shortenedUrlID: string;
    let shortenedUrl: string;

    it('should be issued successfully', async () => {
        const shortUrls = new ShortUrls(accessToken);
        const expiresAt = moment().add(1, 'minutes');
        const result = await shortUrls.shortenUrl(sourceUrl, expiresAt.toDate().toISOString());
        result.id.should.be.a('string');
        result.shortenedUrl.should.be.a('string');
        // @ts-ignore
        result.shortenedUrl.should.have.hostname('shrt.stage.empayre.com');
        result.expiresAt.should.be.sameMoment(expiresAt);
        result.sourceUrl.should.be.eq(sourceUrl);
        shortenedUrlID = result.id;
        shortenedUrl = result.shortenedUrl;
    });

    it('should be resolved successfully', async () => {
        const response = await axios.get(
            shortenedUrl,
            {
                maxRedirects: 0,
                validateStatus: (status_1) => status_1 >= 200 && status_1 < 400
            }
        );
        response.status.should.be.eq(301);
        response.headers.should.have.ownProperty('location');
        response.headers['location'].should.be.eq(sourceUrl);
    });

    it('should be deleted successfully', () => {
        const shortUrls = new ShortUrls(accessToken);
        return shortUrls.deleteShortenedUrl(shortenedUrlID);
    });

    it('should not be resolved anymore', () => {
        return axios.get(shortenedUrl)
            .should.eventually.be.rejectedWith(AxiosError)
            .then((error: AxiosError) => {
                error.response.status.should.be.eq(404);
                error.response.headers.should.not.have.ownProperty('location')
            });
    });
});
