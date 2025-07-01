import { ReactNode } from "react";
import { Col, Row } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import "./PageBreadcrumb.css";

interface PageTitleProps {
  subName?: string;
  title: string;
  addedChild?: ReactNode;
}

const PageBreadcrumb = ({ subName, title, addedChild }: PageTitleProps) => {
  return (
    <>
      <Helmet>
        <title>{title} | Adsol</title>
      </Helmet>
      {subName && (
        <Row>
          <Col xs={12}>
            <div className="page-title-box">
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/" style={{ color: "#6C757D" }}>
                      Adsol
                    </Link>
                  </li>
                  <span className="breadcrumb-separator"> &gt; </span>
                  <li className="breadcrumb-item">{subName}</li>
                  <span className="breadcrumb-separator"> &gt; </span>
                  <li className="breadcrumb-item active">{title}</li>
                </ol>
              </div>
              <h4 className="page-title">{title}</h4>
              {addedChild}
            </div>
          </Col>
        </Row>
      )}
    </>
  );
};

export default PageBreadcrumb;
