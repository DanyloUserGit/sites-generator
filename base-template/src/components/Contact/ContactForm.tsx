import { PageContent } from '@/types';

export default function ContactForm({ content }: { content: PageContent }) {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto" id="form">
      <h2 className="text-3xl font-bold text-center mb-8 ">
        {content.formText?.replaceAll('.', '')}
      </h2>
      <form className="space-y-6 max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:space-x-6">
          <div className="flex-1">
            <label className="block text-gray-dark mb-2" htmlFor="name">
              {content.contactNameText?.replaceAll('.', '')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-dark mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-dark mb-2" htmlFor="message">
            {content.contactMessageText?.replaceAll('.', '')}
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          ></textarea>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-lg font-semibold transition"
          >
            {content.formText?.replaceAll('.', '')}
          </button>
        </div>
      </form>
    </section>
  );
}
