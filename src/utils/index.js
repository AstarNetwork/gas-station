import { ethers } from 'ethers';

export const calculatePriorityFeeToTip = (fee) => {
  //Rate: https://stakesg.slack.com/archives/C028YNW1PED/p1652343972144359?thread_ts=1652338487.358459&cid=C028YNW1PED
  const rate = 15;
  const eth = ethers.utils.formatUnits(String(fee), rate);
  const wei = ethers.utils.parseEther(eth).toString();
  return Number(wei);
};
