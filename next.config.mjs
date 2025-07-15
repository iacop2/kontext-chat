/** @type {import('next').NextConfig} */
import { withBotId } from 'botid/next/config';

const nextConfig = {
  devIndicators: false,
};

export default withBotId(nextConfig);
