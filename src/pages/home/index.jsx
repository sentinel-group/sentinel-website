import React from 'react';
import ReactDOM from 'react-dom';
import 'particles.js';
import { getScrollTop, getLink } from '../../../utils';
import Header from '../../components/header';
import Button from '../../components/button';
import Footer from '../../components/footer';
import Language from '../../components/language';
import Item from './featureItem';
import homeConfig from '../../../site_config/home';
import particles from './particles.json';
import './index.scss';

class Home extends Language {

  constructor(props) {
    super(props);
    this.state = {
      headerType: 'primary',
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', () => {
      const scrollTop = getScrollTop();
      if (scrollTop > 66) {
        this.setState({
          headerType: 'normal',
        });
      } else {
        this.setState({
          headerType: 'primary',
        });
      }
    });
    this.renderParticles();
  }

  renderParticles() {
    window.particlesJS('top-section', particles);
  }

  render() {
    const language = this.getLanguage();
    const dataSource = homeConfig[language];
    const { headerType } = this.state;
    const headerLogo = headerType === 'primary' ? '/img/sentinel_white.png' : '/img/sentinel_colorful.png';
    return (
      <div className="home-page">
        <section className="top-section" id="top-section">
          <Header
            currentKey="home"
            type={headerType}
            logo={headerLogo}
            language={language}
            onLanguageChange={this.onLanguageChange}
          />
          <img className="sentinel-img" src={getLink('/img/sentinel.png')} />
          <div className="vertical-middle">
            <div className="product-name">
              <h2>{dataSource.brand.brandName}</h2>
            </div>
            <p className="product-desc">{dataSource.brand.briefIntroduction}</p>
            <div className="button-area">
            {
              dataSource.brand.buttons.map(b => <Button type={b.type} key={b.type} link={b.link} target={b.target}>{b.text}</Button>)
            }
            </div>
          </div>
        </section>
        <section className="introduction-section">
          <div className="introduction-body">
            <div className="introduction">
              <h3>{dataSource.introduction.title}</h3>
              <p>{dataSource.introduction.desc}</p>
            </div>
            <img src={getLink(dataSource.introduction.img)} />
          </div>
        </section>
        <section className="feature-section">
          <h3>{dataSource.features.title}</h3>
          <ul>
          {
            dataSource.features.list.map((feature, i) => (
              <Item feature={feature} key={i} />
            ))
          }
          </ul>
        </section>
        <section className="msemap-section">
          <div className="msemap-container">
            <h3>{dataSource.msclandscape.title}</h3>
            <div id="mse-arc-container"></div>
          </div>
        </section>
        <section className="start-section">
          <div className="start-body">
            <div className="left-part">
              <h3>{dataSource.start.title}</h3>
              <p>{dataSource.start.desc}</p>
              <a href={getLink(dataSource.start.button.link)} target={dataSource.start.button.link || '_self'}>{dataSource.start.button.text}</a>
              </div>
            <div className="right-part"><img src={getLink('/img/quick_start.png')} /></div>
          </div>
        </section>      
        <section className="users-section">
          <h3>{dataSource.users.title}</h3>
          <p>{dataSource.users.desc}</p>
          <div className="users">
          {
            dataSource.users.list.map((user, i) => (
              <div key={i} className="user"><img src={getLink(user)} /></div>
            ))
          }
          </div>
        </section>
        <Footer logo="/img/sentinel_gray.png" language={language} />
      </div>
    );
  }
}

document.getElementById('root') && ReactDOM.render(<Home />, document.getElementById('root'));

export default Home;
