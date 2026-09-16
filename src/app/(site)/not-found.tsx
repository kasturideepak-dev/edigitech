import { SwitchButton } from "@/components/site/Icon";

export default function NotFound() {
  return (
    <div className="tp-error-area pt-200 pb-140">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <h1 className="tp-section-title fs-100 fw-700 mb-20">404</h1>
            <h2 className="fs-35 fw-500 mb-20">Page not found</h2>
            <p className="fs-18 tp-text-grey-1 mb-40">The page you are looking for doesn’t exist or has been moved.</p>
            <SwitchButton
              href="/"
              label="Back to Home"
              className="tp-btn-lg d-inline-block lh-0 tp-round-26 fs-15 tp-bg-common-black text-uppercase ls-0 tp-btn-switch-animation tp-text-common-white hover-text-white tp-ff-heading fw-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
