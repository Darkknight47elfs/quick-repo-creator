import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-5xl p-6 mx-auto mt-3">
      <h1 className="mt-8 mb-8 text-4xl font-bold text-black">Privacy Policy</h1>
      <p className="mb-4 text-black">Effective Date: 30-01-2025</p>

      <div className="space-y-6">
        {/* Introduction */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">1. Introduction</h2>
          <p className="text-black">
            Welcome to KrishiSat. We value your privacy and are committed to protecting it. 
            This Privacy Policy explains how we handle user information and outlines our 
            approach to data collection, usage, and protection.
          </p>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">2. Information We Collect</h2>
          <p className="text-black">
            When farmers use our KrishiSat web application, we collect the following information:
          </p>
          <ul className="text-black list-disc list-inside">
            <li>Username: A unique identifier.</li>
            <li>Phone Number: Used for authentication via OTP.</li>
            <li>State & District: The location where the farmer operates.</li>
            <li>Organization: The organization the farmer is associated with.</li>
            <li>Padashekaram Name: The farming group the farmer belongs to.</li>
          </ul>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">3. How We Use Your Information</h2>
          <ul className="text-black list-disc list-inside">
            <li>To create and manage user accounts.</li>
            <li>To verify identity using OTP authentication.</li>
            <li>To provide services tailored to the farmer’s region and organization.</li>
            <li>To improve platform functionality and user experience.</li>
            <li>To communicate important updates and notifications.</li>
            <li>To send weekly farm condition updates.</li>
          </ul>
        </section>

        {/* Subscription Preferences */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">4. Subscription Preferences</h2>
          <p className="text-black">Farmers can manage their subscription to weekly farm updates through:</p>
          <ul className="text-black list-disc list-inside">
            <li>Opting in during registration.</li>
            <li>Enabling/disabling notifications in account settings.</li>
            <li>Contacting our support team for assistance.</li>
          </ul>
        </section>

        {/* Data Sharing and Disclosure */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">5. Data Sharing and Disclosure</h2>
          <p className="text-black">We do not sell, trade, or rent user information. However, we may share data:</p>
          <ul className="text-black list-disc list-inside">
            <li>With authorized partners for requested services.</li>
            <li>With legal authorities when required by law.</li>
            <li>During mergers, acquisitions, or business transfers.</li>
          </ul>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">6. Data Security</h2>
          <p className="text-black">
            We implement industry-standard security measures to protect your data from unauthorized access, 
            alteration, disclosure, or destruction.
          </p>
        </section>

        {/* Your Rights and Choices */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">7. Your Rights and Choices</h2>
          <ul className="text-black list-disc list-inside">
            <li>Users can review and update their personal information.</li>
            <li>Users can delete their accounts, subject to legal retention policies.</li>
            <li>Users may opt out of farm condition updates.</li>
          </ul>
        </section>

        {/* Data Retention */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">8. Retention of Data</h2>
          <p className="text-black">
            We retain user information for a year to comply with legal obligations. Upon request, 
            user data will be deleted unless legally required for retention.
          </p>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">9. Children's Privacy</h2>
          <p className="text-black">
            KrishiSat is intended for farmers and is not designed for children under 13. We do not 
            knowingly collect data from children. If such data is discovered, we will take steps to remove it.
          </p>
        </section>

        {/* Changes to Policy */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">10. Changes to This Privacy Policy</h2>
          <p className="text-black">
            We may update this Privacy Policy periodically. Any changes will be posted on this page, 
            and we encourage users to review it regularly.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">11. Contact Us</h2>
          <p className="text-black">
            If you have any questions, contact us at 
            <a href="mailto:info@xbosonai.in" className="text-blue-600 underline"> info@xbosonai.in </a>
            or visit us at:
          </p>
          <address className="not-italic text-black">
            2nd Floor, Administrative Block, Govt Polytechnic College, 
            Koottupaatha, Palakkad, Kerala 678551
          </address>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
